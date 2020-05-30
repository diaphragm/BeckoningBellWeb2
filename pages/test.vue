<template>
<v-select
    v-model="peopleSelected"
    :items="people"
    color="blue-grey lighten-2"
    label="Select"
    item-text="name"
    item-value="name"
>
  <!-- Template for render data when the select is expanded -->
  <template
    slot="item"
    slot-scope="data"
  >
    <!-- Divider and Header-->
    <template v-if="typeof data.item !== 'object'">
      <v-list-item-content v-text="data.item"/>
    </template>
    <!-- Normal item -->
    <template v-else>
      <v-list-item-content>
        <v-list-item-title v-html="data.item.name"/>
        <!-- <v-list-item-sub-title v-html="data.item.group"/> -->
      </v-list-item-content>
    </template>
  </template>
</v-select>
</template>

<script>
export default {
data: () => ({
    peopleSelected:[],
    people: [
        { header: 'Group 1' },
        { name: 'Sandra Adams', group: 'Group 1' },
        { name: 'Ali Connors', group: 'Group 1' },
        { name: 'Trevor Hansen', group: 'Group 1' },
        { name: 'Tucker Smith', group: 'Group 1'},
        { divider: true },
        { header: 'Group 2' },
        { name: 'Britta Holt', group: 'Group 2'},
        { name: 'Jane Smith ', group: 'Group 2'},
        { name: 'John Smith', group: 'Group 2' },
        { name: 'Sandra Williams', group: 'Group 2' }
      ]
  })}
</script>
