import ExpoModulesCore
import UIKit

private struct MentionRange {
  var start: Int
  var end: Int
  var name: String
  var userId: String
}

public final class NativeMentionComposerView: ExpoView, UITextViewDelegate {
  let onComposerChange = EventDispatcher()
  let onMentionQueryChange = EventDispatcher()
  let onSelectionChange = EventDispatcher()
  let onHeightChange = EventDispatcher()

  public var placeholder = "Besked..." {
    didSet { updatePlaceholder() }
  }

  private let textView = UITextView()
  private let placeholderLabel = UILabel()

  private var mentions: [MentionRange] = []
  private var previousText = ""
  private var applyingNativeChange = false
  private var lastHeight: CGFloat = 0

  private let textColor = UIColor(red: 0.106, green: 0.114, blue: 0.133, alpha: 1)
  private let mutedColor = UIColor(red: 0.616, green: 0.631, blue: 0.706, alpha: 1)
  private let mentionColor = UIColor(red: 0.059, green: 0.431, blue: 0.337, alpha: 1)

  private let minTextHeight: CGFloat = 24
  private let maxTextHeight: CGFloat = 120
  // JS wrapper (KeyboardInputBar inner view) owns vertical padding.
  // Keep only horizontal inset so text aligns with the px-2.5 TextInput path.
  private let horizontalPadding: CGFloat = 10

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = false

    textView.delegate = self
    textView.backgroundColor = .clear
    textView.textContainerInset = .zero
    textView.textContainer.lineFragmentPadding = 0
    textView.isScrollEnabled = false
    textView.autocorrectionType = .yes
    textView.autocapitalizationType = .sentences
    textView.keyboardDismissMode = .interactive
    textView.font = composerFont()
    textView.textColor = textColor
    textView.typingAttributes = baseTextAttributes()

    placeholderLabel.textColor = mutedColor
    placeholderLabel.font = composerFont()
    placeholderLabel.text = placeholder

    addSubview(textView)
    addSubview(placeholderLabel)
    updatePlaceholder()
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    updateLayout()
  }

  func focus() { textView.becomeFirstResponder() }
  func blur() { textView.resignFirstResponder() }

  func clear() {
    applyingNativeChange = true
    textView.text = ""
    previousText = ""
    mentions = []
    applyingNativeChange = false
    applyAttributes(keeping: NSRange(location: 0, length: 0))
    emitAll()
  }

  func setTextFromJS(_ value: String) {
    guard value != textView.text else { return }
    applyingNativeChange = true
    textView.text = value
    previousText = value
    mentions = normalizeMentions(text: value, ranges: mentions)
    applyingNativeChange = false
    applyAttributes(keeping: textView.selectedRange)
    updatePlaceholder()
    updateLayout()
  }

  func setMentionsFromJS(_ value: [[String: Any]]) {
    mentions = value.compactMap { item in
      guard
        let start = item["start"] as? Int,
        let end = item["end"] as? Int,
        let name = item["name"] as? String,
        let userId = item["userId"] as? String
      else { return nil }
      return MentionRange(start: start, end: end, name: name, userId: userId)
    }
    mentions = normalizeMentions(text: textView.text, ranges: mentions)
    applyAttributes(keeping: textView.selectedRange)
  }

  func insertMention(userId: String, name: String) {
    let text = textView.text ?? ""
    let replacement = mentionReplacementRange(text: text, selectedRange: textView.selectedRange)
    let mentionText = "@\(name)"
    let nsText = text as NSString
    let nextChar = replacement.location + replacement.length < nsText.length
      ? nsText.substring(with: NSRange(location: replacement.location + replacement.length, length: 1))
      : ""
    let needsSpace = nextChar != " " && nextChar != "\n"
    let insertedText = needsSpace ? "\(mentionText) " : mentionText
    let nextText = nsText.replacingCharacters(in: replacement, with: insertedText)

    var nextMentions = adjustMentionRanges(previousText: text, nextText: nextText, ranges: mentions)
      .filter { $0.end <= replacement.location || $0.start >= replacement.location + replacement.length }
    nextMentions.append(MentionRange(start: replacement.location, end: replacement.location + mentionText.utf16.count, name: name, userId: userId))
    nextMentions.sort { $0.start < $1.start }
    mentions = nextMentions

    let cursor = replacement.location + insertedText.utf16.count
    applyingNativeChange = true
    textView.text = nextText
    previousText = nextText
    textView.selectedRange = NSRange(location: cursor, length: 0)
    applyingNativeChange = false
    applyAttributes(keeping: textView.selectedRange)
    emitAll(query: nil)
  }

  func payload() -> [String: Any] {
    ["text": textView.text ?? "", "mentions": mentionPayload()]
  }

  public func textViewDidChange(_ textView: UITextView) {
    guard !applyingNativeChange else { return }
    let nextText = textView.text ?? ""
    mentions = normalizeMentions(
      text: nextText,
      ranges: adjustMentionRanges(previousText: previousText, nextText: nextText, ranges: mentions)
    )
    previousText = nextText
    applyAttributes(keeping: textView.selectedRange)
    emitAll()
  }

  public func textViewDidChangeSelection(_ textView: UITextView) {
    guard !applyingNativeChange else { return }
    emitSelectionAndQuery()
  }

  public func textView(
    _ textView: UITextView,
    shouldChangeTextIn range: NSRange,
    replacementText text: String
  ) -> Bool {
    guard text.isEmpty, range.length <= 1 else { return true }
    guard let deleteRange = atomicMentionDeleteRange(for: range) else { return true }

    let current = textView.text ?? ""
    let nextText = (current as NSString).replacingCharacters(in: deleteRange, with: "")
    let nextSelection = NSRange(location: deleteRange.location, length: 0)

    mentions = adjustMentionRanges(previousText: current, nextText: nextText, ranges: mentions)
      .filter { !rangesIntersect($0.nsRange, deleteRange) }
    applyingNativeChange = true
    textView.text = nextText
    previousText = nextText
    textView.selectedRange = nextSelection
    applyingNativeChange = false
    applyAttributes(keeping: nextSelection)
    emitAll()
    return false
  }

  private func updateLayout() {
    let width = bounds.width
    guard width > 0 else {
      setViewSize(CGSize(width: 1, height: minTextHeight))
      return
    }
    let textWidth = max(1, width - horizontalPadding * 2)
    let textHeight = measuredTextHeight(forWidth: textWidth)
    textView.frame = CGRect(x: horizontalPadding, y: 0, width: textWidth, height: textHeight)
    placeholderLabel.frame = CGRect(x: horizontalPadding, y: 0, width: textWidth, height: minTextHeight)
    textView.isScrollEnabled = textHeight >= maxTextHeight
    if abs(textHeight - lastHeight) > 0.5 {
      lastHeight = textHeight
      setViewSize(CGSize(width: width, height: textHeight))
      onHeightChange(["height": textHeight])
    }
  }

  private func measuredTextHeight(forWidth width: CGFloat) -> CGFloat {
    let size = textView.sizeThatFits(CGSize(width: width, height: CGFloat.greatestFiniteMagnitude))
    return min(maxTextHeight, max(minTextHeight, ceil(size.height)))
  }

  private func updatePlaceholder() {
    placeholderLabel.text = placeholder
    placeholderLabel.isHidden = !(textView.text ?? "").isEmpty
  }

  private func applyAttributes(keeping selection: NSRange) {
    let text = textView.text ?? ""
    let textLength = (text as NSString).length
    let safeLocation = min(selection.location, textLength)
    let safeLength = min(selection.length, max(0, textLength - safeLocation))
    let safeSelection = NSRange(location: safeLocation, length: safeLength)

    textView.font = composerFont()
    textView.textColor = textColor
    textView.typingAttributes = baseTextAttributes()

    guard textLength > 0, textView.markedTextRange == nil else {
      textView.selectedRange = safeSelection
      updatePlaceholder()
      updateLayout()
      return
    }

    applyingNativeChange = true
    textView.textStorage.beginEditing()
    textView.textStorage.setAttributes(baseTextAttributes(), range: NSRange(location: 0, length: textLength))
    for mention in normalizeMentions(text: text, ranges: mentions) {
      textView.textStorage.addAttribute(.foregroundColor, value: mentionColor, range: mention.nsRange)
    }
    textView.textStorage.endEditing()
    textView.typingAttributes = baseTextAttributes()
    textView.selectedRange = safeSelection
    applyingNativeChange = false
    updatePlaceholder()
    updateLayout()
  }

  private func emitAll(query: String? = nil) {
    updatePlaceholder()
    updateLayout()
    onComposerChange(payload())
    emitSelectionAndQuery(queryOverride: query)
  }

  private func emitSelectionAndQuery(queryOverride: String? = nil) {
    let selection = textView.selectedRange
    onSelectionChange(["start": selection.location, "end": selection.location + selection.length])
    if let queryOverride {
      onMentionQueryChange(["query": queryOverride])
    } else {
      let query = mentionQuery(text: textView.text ?? "", cursor: selection.location)
      onMentionQueryChange(["query": query as Any])
    }
  }

  private func mentionPayload() -> [[String: Any]] {
    normalizeMentions(text: textView.text ?? "", ranges: mentions).map {
      ["start": $0.start, "end": $0.end, "name": $0.name, "userId": $0.userId]
    }
  }

  private func atomicMentionDeleteRange(for range: NSRange) -> NSRange? {
    guard range.length <= 1 else { return nil }
    let deletionStart = range.length == 0 ? max(0, range.location - 1) : range.location
    let deletionRange = NSRange(location: deletionStart, length: max(1, range.length))
    let text = textView.text ?? ""
    let nsText = text as NSString
    guard NSMaxRange(deletionRange) <= nsText.length else { return nil }
    let deletedText = nsText.substring(with: deletionRange)
    if deletedText == " " || deletedText == "\n" { return nil }
    return mentions.first { mention in
      deletionStart >= mention.start && deletionStart < mention.end
    }?.nsRange
  }

  private func composerFont() -> UIFont {
    UIFont(name: "Outfit-Regular", size: 16) ?? UIFont.systemFont(ofSize: 16)
  }

  private func baseTextAttributes() -> [NSAttributedString.Key: Any] {
    [.font: composerFont(), .foregroundColor: textColor]
  }
}

private extension MentionRange {
  var nsRange: NSRange { NSRange(location: start, length: end - start) }
}

private let wordBreak = CharacterSet.whitespacesAndNewlines.union(CharacterSet(charactersIn: ".,!?;:()[]{}\"'<>"))

private func mentionQuery(text: String, cursor: Int) -> String? {
  guard cursor >= 1 else { return nil }
  let nsText = text as NSString
  var start = cursor - 1
  while start >= 0 {
    let character = nsText.substring(with: NSRange(location: start, length: 1))
    if character.rangeOfCharacter(from: wordBreak) != nil { break }
    start -= 1
  }
  let wordStart = start + 1
  guard wordStart < nsText.length, nsText.substring(with: NSRange(location: wordStart, length: 1)) == "@" else {
    return nil
  }
  return nsText.substring(with: NSRange(location: wordStart + 1, length: cursor - wordStart - 1))
}

private func mentionReplacementRange(text: String, selectedRange: NSRange) -> NSRange {
  guard selectedRange.length == 0 else { return selectedRange }
  let nsText = text as NSString
  var start = selectedRange.location - 1
  while start >= 0 {
    let character = nsText.substring(with: NSRange(location: start, length: 1))
    if character.rangeOfCharacter(from: wordBreak) != nil { break }
    start -= 1
  }
  let wordStart = start + 1
  guard wordStart < nsText.length, nsText.substring(with: NSRange(location: wordStart, length: 1)) == "@" else {
    return selectedRange
  }
  return NSRange(location: wordStart, length: selectedRange.location - wordStart)
}

private func adjustMentionRanges(previousText: String, nextText: String, ranges: [MentionRange]) -> [MentionRange] {
  guard !ranges.isEmpty, previousText != nextText else { return ranges }
  let old = previousText as NSString
  let new = nextText as NSString
  let minLength = min(old.length, new.length)
  var prefix = 0
  while prefix < minLength && old.substring(with: NSRange(location: prefix, length: 1)) == new.substring(with: NSRange(location: prefix, length: 1)) {
    prefix += 1
  }
  var suffix = 0
  while suffix < old.length - prefix &&
    suffix < new.length - prefix &&
    old.substring(with: NSRange(location: old.length - 1 - suffix, length: 1)) == new.substring(with: NSRange(location: new.length - 1 - suffix, length: 1)) {
    suffix += 1
  }
  let previousEnd = old.length - suffix
  let nextEnd = new.length - suffix
  let delta = nextEnd - previousEnd
  return ranges.compactMap { range in
    if previousEnd <= range.start {
      return MentionRange(start: range.start + delta, end: range.end + delta, name: range.name, userId: range.userId)
    }
    if prefix >= range.end { return range }
    return nil
  }
}

private func normalizeMentions(text: String, ranges: [MentionRange]) -> [MentionRange] {
  let nsText = text as NSString
  return ranges.filter { range in
    range.start >= 0 &&
      range.end <= nsText.length &&
      range.end > range.start &&
      nsText.substring(with: range.nsRange) == "@\(range.name)"
  }
}

private func rangesIntersect(_ lhs: NSRange, _ rhs: NSRange) -> Bool {
  NSIntersectionRange(lhs, rhs).length > 0
}
