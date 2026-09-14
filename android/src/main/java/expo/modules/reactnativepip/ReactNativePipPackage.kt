package expo.modules.reactnativepip

import android.content.Context
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class ReactNativePipPackage : Package {
  override fun createReactActivityLifecycleListeners(
    activityContext: Context?
  ): List<ReactActivityLifecycleListener> {
    return listOf(PipLifecycleListener())
  }
}
