import ExpoModulesCore

public class NativeMentionComposerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("NativeMentionComposer")

    View(NativeMentionComposerView.self) {
      Events(
        "onComposerChange",
        "onMentionQueryChange",
        "onSelectionChange",
        "onHeightChange"
      )

      Prop("value") { (view: NativeMentionComposerView, value: String) in
        view.setTextFromJS(value)
      }

      Prop("placeholder") { (view: NativeMentionComposerView, value: String) in
        view.placeholder = value
      }

      Prop("mentions") { (view: NativeMentionComposerView, value: [[String: Any]]) in
        view.setMentionsFromJS(value)
      }

      AsyncFunction("focus") { (view: NativeMentionComposerView) in
        view.focus()
      }

      AsyncFunction("blur") { (view: NativeMentionComposerView) in
        view.blur()
      }

      AsyncFunction("clear") { (view: NativeMentionComposerView) in
        view.clear()
      }

      AsyncFunction("insertMention") { (view: NativeMentionComposerView, userId: String, name: String) in
        view.insertMention(userId: userId, name: name)
      }

      AsyncFunction("getPayload") { (view: NativeMentionComposerView) -> [String: Any] in
        view.payload()
      }
    }
  }
}
