<template>
  <v-select v-bind:value="value" v-on:input="$emit('input', $event)" :items="transformed" :rules="rules" :label="label" :hint="hint" persistent-hint>
    <template v-slot:selection="data">
      <v-list-item-content v-text="data.item.value" />
    </template>
    <template v-slot:item="data">
      <v-list-item-content v-text="data.item.value" />
    </template>
  </v-select>
</template>

<script>
export default {
  props: ['value', 'items', 'rules', 'label', 'hint'],
  computed: {
    transformed() {
      const ret = []
      Object.entries(this.items).forEach(([group, places]) => {
        ret.push({header: group})
        places.forEach((place) => {
          ret.push({value: place, group: group})
        })
        ret.push({divider: true})
      })
      ret.pop()
      return ret
    }
  },
}
</script>
