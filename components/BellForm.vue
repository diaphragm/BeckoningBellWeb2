<template>
  <v-form ref="form" v-model="form.valid">
    <group-select v-model="form.place" :items="placeList" :rules="[required]" label="場所"
      hint="どこで鐘をならしていますか？" class="py-4"/>
    <v-text-field v-model="form.password" label="合言葉" persistent-hint :rules="[required, charCount(50)]"
      hint="合言葉を設定しないと、レベル差がある他のプレイヤーとのマルチプレイができません。" class="py-4" />
    <v-textarea v-model="form.note" label="備考" persistent-hint :rules="[charCount(300)]"
      hint="周回数、レベル、プレイ方針、契約カレル、聖杯ダンジョンの内容などを書くと親切かもしれません。" class="py-4"/>
    <v-radio-group v-model="form.region" label="マッチング地域" :row="$vuetify.breakpoint.mdAndUp" mandatory>
      <v-radio label="ローカル" value="ローカル" />
      <v-radio label="ワールドワイド" value="ワールドワイド" />
    </v-radio-group>
  </v-form>
</template>

<script>
import { PlaceList } from '~/assets/BloodborneUtils.js'
import GroupSelect from '~/components/GroupSelect.vue'

export default {
  props: ['form'],
  data() {
    return {
      placeList: PlaceList,
      required: v =>  v ? true : '入力は必須です。',
    }
  },
  components: {
    GroupSelect
  },
  methods: {
    validate() {
      return this.$refs.form.validate()
    },
    charCount(limit) {
      return ((v) => {
        return (v || '').length <= limit ? true : `${limit}文字以内にしてください。`
      })
    }
  }
}
</script>
