package expo.modules.reactnativepip

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class AspectRatioRecord : Record {
  @Field val width: Int = 16
  @Field val height: Int = 9
}

class ActionRecord : Record {
  @Field val id: String = ""
  @Field val icon: String = ""
  @Field val title: String = ""
  @Field val description: String? = null
}

class ParamsRecord : Record {
  @Field val aspectRatio: AspectRatioRecord? = null
  @Field val actions: List<ActionRecord> = emptyList()
  @Field val autoEnter: Boolean = false
  @Field val seamlessResize: Boolean? = null
  @Field val title: String? = null
  @Field val subtitle: String? = null
}
