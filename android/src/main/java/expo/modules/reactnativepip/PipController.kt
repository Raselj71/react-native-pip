package expo.modules.reactnativepip

import android.app.Activity
import android.app.PendingIntent
import android.app.PictureInPictureParams
import android.app.RemoteAction
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.drawable.Icon
import android.os.Build
import android.util.Log
import android.util.Rational
import androidx.annotation.RequiresApi

internal object PipController {
  const val ACTION_INTENT = "expo.modules.reactnativepip.ACTION"
  const val EXTRA_ACTION_ID = "id"

  private const val TAG = "ReactNativePip"
  private const val ICON_PREFIX = "rnpip_"

  @Volatile
  var params: ParamsRecord? = null

  @Volatile
  var enterOnLeave = false

  @Volatile
  var module: ReactNativePipModule? = null

  fun isSupported(context: Context?): Boolean {
    if (context == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return false
    }
    return context.packageManager.hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE)
  }

  fun apply(activity: Activity?) {
    val current = params ?: return
    if (activity == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    activity.runOnUiThread {
      runCatching { activity.setPictureInPictureParams(buildParams(activity, current)) }
        .onFailure { Log.w(TAG, "setPictureInPictureParams failed", it) }
    }
  }

  fun clear(activity: Activity?) {
    val hadParams = params != null
    params = null
    if (!hadParams || activity == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    activity.runOnUiThread {
      runCatching { activity.setPictureInPictureParams(offParams()) }
        .onFailure { Log.w(TAG, "clearing PiP params failed", it) }
    }
  }

  fun reset(activity: Activity?) {
    enterOnLeave = false
    clear(activity)
  }

  fun enter(activity: Activity?): Boolean {
    if (activity == null || !isSupported(activity) || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return false
    }
    if (activity.isInPictureInPictureMode) {
      return true
    }
    return runCatching {
      activity.enterPictureInPictureMode(buildParams(activity, params ?: ParamsRecord()))
    }.onFailure { Log.w(TAG, "enterPictureInPictureMode failed", it) }.getOrDefault(false)
  }

  fun enterOnUserLeave(activity: Activity?) {
    if (!enterOnLeave || activity == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val current = params ?: return
    if (activity.isInPictureInPictureMode) {
      return
    }
    runCatching {
      val built = buildParams(activity, current)
      activity.setPictureInPictureParams(built)
      activity.enterPictureInPictureMode(built)
    }.onFailure { Log.w(TAG, "enter on user leave failed", it) }
  }

  fun exit(activity: Activity?) {
    if (activity == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    activity.runOnUiThread {
      if (activity.isInPictureInPictureMode) {
        activity.moveTaskToBack(true)
      }
    }
  }

  fun isInPip(activity: Activity?): Boolean {
    if (activity == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return false
    }
    return activity.isInPictureInPictureMode
  }

  fun maxActions(activity: Activity?): Int {
    if (activity == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return 0
    }
    return activity.maxNumPictureInPictureActions
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun buildParams(context: Context, record: ParamsRecord): PictureInPictureParams {
    val builder = PictureInPictureParams.Builder()
    record.aspectRatio?.let { builder.setAspectRatio(Rational(it.width, it.height)) }
    builder.setActions(buildActions(context, record.actions))
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      builder.setAutoEnterEnabled(record.autoEnter)
      record.seamlessResize?.let { builder.setSeamlessResizeEnabled(it) }
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      record.title?.let { builder.setTitle(it) }
      record.subtitle?.let { builder.setSubtitle(it) }
    }
    return builder.build()
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun offParams(): PictureInPictureParams {
    val builder = PictureInPictureParams.Builder().setActions(emptyList())
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      builder.setAutoEnterEnabled(false)
    }
    return builder.build()
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun buildActions(context: Context, actions: List<ActionRecord>): List<RemoteAction> {
    return actions.mapIndexedNotNull { index, action ->
      val iconRes = resolveIcon(context, action.icon)
      if (iconRes == 0) {
        Log.w(TAG, "PiP action icon '${action.icon}' not found — register it in the config plugin's icons")
        return@mapIndexedNotNull null
      }
      val intent = Intent(context, PipActionReceiver::class.java)
        .setAction(ACTION_INTENT)
        .putExtra(EXTRA_ACTION_ID, action.id)
      val pendingIntent = PendingIntent.getBroadcast(
        context,
        index,
        intent,
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
      )
      RemoteAction(
        Icon.createWithResource(context, iconRes),
        action.title,
        action.description ?: action.title,
        pendingIntent
      )
    }
  }

  private fun resolveIcon(context: Context, name: String): Int {
    val clean = name.lowercase().replace(Regex("[^a-z0-9_]"), "_")
    val prefixed = context.resources.getIdentifier(ICON_PREFIX + clean, "drawable", context.packageName)
    if (prefixed != 0) {
      return prefixed
    }
    return context.resources.getIdentifier(clean, "drawable", context.packageName)
  }
}
