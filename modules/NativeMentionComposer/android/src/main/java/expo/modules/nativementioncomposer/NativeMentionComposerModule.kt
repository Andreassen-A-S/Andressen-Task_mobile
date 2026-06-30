package expo.modules.nativementioncomposer

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NativeMentionComposerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NativeMentionComposer")

    View(NativeMentionComposerView::class) {
      Events(
        "onComposerChange",
        "onMentionQueryChange",
        "onSelectionChange",
        "onHeightChange"
      )

      Prop("value") { view: NativeMentionComposerView, value: String ->
        view.setTextFromJS(value)
      }

      Prop("placeholder") { view: NativeMentionComposerView, value: String ->
        view.placeholder = value
      }

      Prop("mentions") { view: NativeMentionComposerView, value: List<Map<String, Any?>> ->
        view.setMentionsFromJS(value)
      }

      AsyncFunction("focus") { view: NativeMentionComposerView ->
        view.focus()
      }

      AsyncFunction("blur") { view: NativeMentionComposerView ->
        view.blur()
      }

      AsyncFunction("clear") { view: NativeMentionComposerView ->
        view.clear()
      }

      AsyncFunction("insertMention") { view: NativeMentionComposerView, userId: String, name: String ->
        view.insertMention(userId, name)
      }

      AsyncFunction("getPayload") { view: NativeMentionComposerView ->
        view.payload()
      }
    }
  }
}
