package expo.modules.reactnativepip

import android.app.Activity
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.core.app.PictureInPictureModeChangedInfo
import androidx.core.util.Consumer
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class PipLifecycleListener : ReactActivityLifecycleListener {
  private var modeListener: Consumer<PictureInPictureModeChangedInfo>? = null

  override fun onCreate(activity: Activity?, savedInstanceState: Bundle?) {
    val owner = activity as? ComponentActivity ?: return
    val listener = Consumer<PictureInPictureModeChangedInfo> { info ->
      PipController.module?.emitModeChange(info.isInPictureInPictureMode)
    }
    owner.addOnPictureInPictureModeChangedListener(listener)
    modeListener = listener
  }

  override fun onUserLeaveHint(activity: Activity?) {
    PipController.enterOnUserLeave(activity)
  }

  override fun onDestroy(activity: Activity?) {
    val owner = activity as? ComponentActivity ?: return
    modeListener?.let { owner.removeOnPictureInPictureModeChangedListener(it) }
    modeListener = null
  }
}
