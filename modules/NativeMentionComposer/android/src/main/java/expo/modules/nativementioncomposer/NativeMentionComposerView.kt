package expo.modules.nativementioncomposer

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.text.Editable
import android.text.Spannable
import android.text.TextWatcher
import android.text.style.ForegroundColorSpan
import android.util.TypedValue
import android.view.Gravity
import android.view.KeyEvent
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min

private data class MentionRange(
  val start: Int,
  val end: Int,
  val name: String,
  val userId: String
)

class NativeMentionComposerView(
  context: Context,
  appContext: AppContext
) : ExpoView(context, appContext) {
  val onComposerChange by EventDispatcher()
  val onSubmit by EventDispatcher()
  val onAddPress by EventDispatcher()
  val onMentionQueryChange by EventDispatcher()
  val onSelectionChange by EventDispatcher()
  val onHeightChange by EventDispatcher()

  var placeholder: String = "Besked..."
    set(value) {
      field = value
      editText.hint = value
    }

  var canSubmit: Boolean = false
    set(value) {
      field = value
      updateButtons()
    }

  var isSubmitting: Boolean = false
    set(value) {
      field = value
      updateButtons()
    }

  private val editText = MentionEditText(context) {
    if (!applyingNativeChange) {
      emitSelectionAndQuery()
    }
  }
  private val addButton = TextView(context)
  private val sendButton = TextView(context)
  private val spinner = ProgressBar(context)

  private var mentions: List<MentionRange> = emptyList()
  private var previousText = ""
  private var applyingNativeChange = false
  private var lastHeight = 0

  private val textColor = Color.rgb(27, 29, 34)
  private val mutedColor = Color.rgb(157, 161, 180)
  private val mentionColor = Color.rgb(15, 110, 86)
  private val buttonMuted = Color.rgb(243, 243, 240)
  private val buttonSecondaryText = Color.rgb(107, 112, 132)
  private val green = Color.rgb(15, 110, 86)

  private val topPadding = dp(14)
  private val horizontalPadding = dp(10)
  private val buttonTop = dp(12)
  private val buttonSize = dp(40)
  private val bottomPadding = dp(8)
  private val minTextHeight = dp(24)
  private val maxTextHeight = dp(120)

  init {
    orientation = VERTICAL
    clipChildren = false
    clipToPadding = false

    editText.setBackgroundColor(Color.TRANSPARENT)
    editText.setTextColor(textColor)
    editText.setHintTextColor(mutedColor)
    editText.hint = placeholder
    editText.textSize = 16f
    editText.includeFontPadding = false
    editText.typeface = Typeface.create("Outfit_400Regular", Typeface.NORMAL)
    editText.gravity = Gravity.TOP or Gravity.START
    editText.minHeight = minTextHeight
    editText.maxHeight = maxTextHeight
    editText.setPadding(0, 0, 0, 0)
    editText.isVerticalScrollBarEnabled = false

    addButton.text = "+"
    addButton.textSize = 28f
    addButton.gravity = Gravity.CENTER
    addButton.setTextColor(buttonSecondaryText)
    addButton.setBackgroundColor(buttonMuted)
    addButton.setOnClickListener { onAddPress(emptyMap()) }

    sendButton.text = "↑"
    sendButton.textSize = 24f
    sendButton.gravity = Gravity.CENTER
    sendButton.setOnClickListener {
      if (canSubmit && !isSubmitting) {
        onSubmit(payload())
      }
    }

    spinner.visibility = GONE

    addView(editText)
    addView(addButton)
    addView(sendButton)
    addView(spinner)

    editText.addTextChangedListener(object : TextWatcher {
      override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
      override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = Unit
      override fun afterTextChanged(editable: Editable?) {
        if (applyingNativeChange) return
        val nextText = editable?.toString().orEmpty()
        mentions = normalizeMentions(nextText, adjustMentionRanges(previousText, nextText, mentions))
        previousText = nextText
        applyMentionSpans()
        emitAll()
      }
    })

    editText.setOnKeyListener { _, keyCode, event ->
      if (keyCode == KeyEvent.KEYCODE_DEL && event.action == KeyEvent.ACTION_DOWN) {
        handleBackspace()
      } else {
        false
      }
    }

    updateButtons()
  }

  fun focus() {
    editText.requestFocus()
    val inputMethodManager = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
    inputMethodManager.showSoftInput(editText, InputMethodManager.SHOW_IMPLICIT)
  }

  fun blur() {
    editText.clearFocus()
  }

  fun clear() {
    applyingNativeChange = true
    editText.setText("")
    editText.setSelection(0)
    previousText = ""
    mentions = emptyList()
    applyingNativeChange = false
    emitAll()
  }

  fun setTextFromJS(value: String) {
    if (value == editText.text.toString()) return
    applyingNativeChange = true
    editText.setText(value)
    editText.setSelection(value.length)
    previousText = value
    mentions = normalizeMentions(value, mentions)
    applyingNativeChange = false
    applyMentionSpans()
    updateNativeSize()
  }

  fun setMentionsFromJS(value: List<Map<String, Any?>>) {
    mentions = value.mapNotNull { item ->
      val start = (item["start"] as? Number)?.toInt() ?: return@mapNotNull null
      val end = (item["end"] as? Number)?.toInt() ?: return@mapNotNull null
      val name = item["name"] as? String ?: return@mapNotNull null
      val userId = item["userId"] as? String ?: return@mapNotNull null
      MentionRange(start, end, name, userId)
    }
    mentions = normalizeMentions(editText.text.toString(), mentions)
    applyMentionSpans()
  }

  fun insertMention(userId: String, name: String) {
    val currentText = editText.text.toString()
    val selectionStart = editText.selectionStart.coerceAtLeast(0)
    val selectionEnd = editText.selectionEnd.coerceAtLeast(selectionStart)
    val replacement = mentionReplacementRange(currentText, selectionStart, selectionEnd)
    val mentionText = "@$name"
    val nextChar = currentText.getOrNull(replacement.last)
    val needsSpace = nextChar != ' ' && nextChar != '\n'
    val insertedText = if (needsSpace) "$mentionText " else mentionText
    val nextText = currentText.substring(0, replacement.first) + insertedText + currentText.substring(replacement.last)

    val nextMentions = adjustMentionRanges(currentText, nextText, mentions)
      .filter { it.end <= replacement.first || it.start >= replacement.last }
      .plus(MentionRange(replacement.first, replacement.first + mentionText.length, name, userId))
      .sortedBy { it.start }
    mentions = nextMentions

    val cursor = replacement.first + insertedText.length
    applyingNativeChange = true
    editText.setText(nextText)
    editText.setSelection(cursor)
    previousText = nextText
    applyingNativeChange = false
    applyMentionSpans()
    emitAll(null)
  }

  fun payload(): Map<String, Any?> {
    return mapOf(
      "text" to editText.text.toString(),
      "mentions" to mentionPayload()
    )
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    super.onLayout(changed, left, top, right, bottom)
    val width = right - left
    val textWidth = max(1, width - horizontalPadding * 2)
    val textHeight = measuredTextHeight(textWidth)
    val buttonY = topPadding + textHeight + buttonTop

    editText.layout(horizontalPadding, topPadding, horizontalPadding + textWidth, topPadding + textHeight)
    addButton.layout(horizontalPadding - dp(2), buttonY, horizontalPadding - dp(2) + buttonSize, buttonY + buttonSize)
    sendButton.layout(width - horizontalPadding - buttonSize + dp(2), buttonY, width - horizontalPadding + dp(2), buttonY + buttonSize)
    spinner.layout(width - horizontalPadding - buttonSize + dp(2), buttonY, width - horizontalPadding + dp(2), buttonY + buttonSize)
    updateNativeSize()
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    val width = MeasureSpec.getSize(widthMeasureSpec)
    val textWidth = max(1, width - horizontalPadding * 2)
    val textHeight = measuredTextHeight(textWidth)
    val height = topPadding + textHeight + buttonTop + buttonSize + bottomPadding

    editText.measure(
      MeasureSpec.makeMeasureSpec(textWidth, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(textHeight, MeasureSpec.EXACTLY)
    )
    val buttonSpec = MeasureSpec.makeMeasureSpec(buttonSize, MeasureSpec.EXACTLY)
    addButton.measure(buttonSpec, buttonSpec)
    sendButton.measure(buttonSpec, buttonSpec)
    spinner.measure(buttonSpec, buttonSpec)
    setMeasuredDimension(width, height)
  }

  private fun handleBackspace(): Boolean {
    val start = editText.selectionStart
    val end = editText.selectionEnd
    if (start != end || start <= 0) return false

    val currentText = editText.text.toString()
    val deletedChar = currentText.getOrNull(start - 1)
    if (deletedChar == ' ' || deletedChar == '\n') return false

    val mention = mentions.firstOrNull { start - 1 >= it.start && start - 1 < it.end } ?: return false
    val nextText = currentText.removeRange(mention.start, mention.end)
    mentions = adjustMentionRanges(currentText, nextText, mentions).filter { it != mention }

    applyingNativeChange = true
    editText.setText(nextText)
    editText.setSelection(mention.start)
    previousText = nextText
    applyingNativeChange = false
    applyMentionSpans()
    emitAll()
    return true
  }

  private fun applyMentionSpans() {
    val editable = editText.text ?: return
    val text = editable.toString()
    editText.setTextColor(textColor)
    editable.getSpans(0, editable.length, ForegroundColorSpan::class.java).forEach { span ->
      editable.removeSpan(span)
    }
    normalizeMentions(text, mentions).forEach { mention ->
      editable.setSpan(ForegroundColorSpan(mentionColor), mention.start, mention.end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
    }
    updateNativeSize()
  }

  private fun emitAll(query: String? = mentionQuery(editText.text.toString(), editText.selectionStart)) {
    updateNativeSize()
    onComposerChange(payload())
    emitSelectionAndQuery(query)
  }

  private fun emitSelectionAndQuery(queryOverride: String? = null) {
    val start = editText.selectionStart.coerceAtLeast(0)
    val end = editText.selectionEnd.coerceAtLeast(start)
    onSelectionChange(mapOf("start" to start, "end" to end))
    onMentionQueryChange(mapOf("query" to queryOverride))
  }

  private fun updateButtons() {
    sendButton.isEnabled = canSubmit && !isSubmitting
    sendButton.setBackgroundColor(if (canSubmit) green else buttonMuted)
    sendButton.setTextColor(if (canSubmit) Color.WHITE else buttonSecondaryText)
    sendButton.text = if (isSubmitting) "" else "↑"
    spinner.visibility = if (isSubmitting) VISIBLE else GONE
  }

  private fun updateNativeSize() {
    val width = max(1, width)
    val height = topPadding + measuredTextHeight(max(1, width - horizontalPadding * 2)) + buttonTop + buttonSize + bottomPadding
    if (height != lastHeight) {
      lastHeight = height
      shadowNodeProxy.setViewSize(width.toDouble(), height.toDouble())
      onHeightChange(mapOf("height" to height))
      requestLayout()
    }
  }

  private fun measuredTextHeight(textWidth: Int): Int {
    editText.measure(
      MeasureSpec.makeMeasureSpec(textWidth, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED)
    )
    return min(maxTextHeight, max(minTextHeight, ceil(editText.measuredHeight.toDouble()).toInt()))
  }

  private fun mentionPayload(): List<Map<String, Any?>> {
    val text = editText.text.toString()
    return normalizeMentions(text, mentions).map {
      mapOf("start" to it.start, "end" to it.end, "name" to it.name, "userId" to it.userId)
    }
  }

  private fun dp(value: Int): Int {
    return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, value.toFloat(), resources.displayMetrics).toInt()
  }
}

private fun mentionQuery(text: String, cursor: Int): String? {
  if (cursor < 1) return null
  var start = cursor - 1
  while (start >= 0 && !isWordBreak(text[start])) start -= 1
  val wordStart = start + 1
  if (wordStart >= text.length || text[wordStart] != '@') return null
  return text.substring(wordStart + 1, cursor)
}

private fun mentionReplacementRange(text: String, selectionStart: Int, selectionEnd: Int): IntRange {
  if (selectionStart != selectionEnd) return selectionStart until selectionEnd
  var start = selectionStart - 1
  while (start >= 0 && !isWordBreak(text[start])) start -= 1
  val wordStart = start + 1
  if (wordStart >= text.length || text[wordStart] != '@') return selectionStart until selectionEnd
  return wordStart until selectionStart
}

private fun isWordBreak(char: Char): Boolean {
  return char.isWhitespace() || ".,!?;:()[]{}\"'<>".contains(char)
}

private fun adjustMentionRanges(previousText: String, nextText: String, ranges: List<MentionRange>): List<MentionRange> {
  if (ranges.isEmpty() || previousText == nextText) return ranges

  val minLength = min(previousText.length, nextText.length)
  var prefix = 0
  while (prefix < minLength && previousText[prefix] == nextText[prefix]) prefix += 1

  var suffix = 0
  while (
    suffix < previousText.length - prefix &&
    suffix < nextText.length - prefix &&
    previousText[previousText.length - 1 - suffix] == nextText[nextText.length - 1 - suffix]
  ) {
    suffix += 1
  }

  val previousEnd = previousText.length - suffix
  val nextEnd = nextText.length - suffix
  val delta = nextEnd - previousEnd

  return ranges.mapNotNull { range ->
    when {
      previousEnd <= range.start -> range.copy(start = range.start + delta, end = range.end + delta)
      prefix >= range.end -> range
      else -> null
    }
  }
}

private fun normalizeMentions(text: String, ranges: List<MentionRange>): List<MentionRange> {
  return ranges.filter { range ->
    range.start >= 0 &&
      range.end <= text.length &&
      range.end > range.start &&
      text.substring(range.start, range.end) == "@${range.name}"
  }
}

private class MentionEditText(
  context: Context,
  private val onSelectionChangedCallback: () -> Unit
) : EditText(context) {
  override fun onSelectionChanged(selStart: Int, selEnd: Int) {
    super.onSelectionChanged(selStart, selEnd)
    onSelectionChangedCallback()
  }
}
