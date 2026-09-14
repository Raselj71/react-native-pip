package expo.modules.reactnativepip

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class PipActionReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context?, intent: Intent?) {
    if (intent?.action != PipController.ACTION_INTENT) {
      return
    }
    val id = intent.getStringExtra(PipController.EXTRA_ACTION_ID) ?: return
    PipController.module?.emitAction(id)
  }
}
