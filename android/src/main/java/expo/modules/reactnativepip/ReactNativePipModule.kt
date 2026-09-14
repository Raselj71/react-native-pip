package expo.modules.reactnativepip

import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ReactNativePipModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ReactNativePip")

    Events(MODE_EVENT, ACTION_EVENT)

    OnCreate {
      PipController.module = this@ReactNativePipModule
    }

    OnDestroy {
      if (PipController.module === this@ReactNativePipModule) {
        PipController.module = null
        PipController.reset(appContext.currentActivity)
      }
    }

    OnActivityEntersForeground {
      PipController.apply(appContext.currentActivity)
    }

    Function("isSupported") {
      PipController.isSupported(appContext.reactContext)
    }

    Function("setParams") { params: ParamsRecord ->
      PipController.params = params
      PipController.apply(appContext.currentActivity)
    }

    Function("clearParams") {
      PipController.clear(appContext.currentActivity)
    }

    Function("setEnterOnLeave") { enabled: Boolean ->
      PipController.enterOnLeave = enabled
    }

    AsyncFunction("enter") {
      PipController.enter(appContext.currentActivity)
    }.runOnQueue(Queues.MAIN)

    Function("exit") {
      PipController.exit(appContext.currentActivity)
    }

    Function("isInPip") {
      PipController.isInPip(appContext.currentActivity)
    }

    Function("getMaxActions") {
      PipController.maxActions(appContext.currentActivity)
    }
  }

  fun emitModeChange(isInPip: Boolean) {
    sendEvent(MODE_EVENT, mapOf("isInPip" to isInPip))
  }

  fun emitAction(id: String) {
    sendEvent(ACTION_EVENT, mapOf("id" to id))
  }

  private companion object {
    const val MODE_EVENT = "onPipModeChange"
    const val ACTION_EVENT = "onPipAction"
  }
}
