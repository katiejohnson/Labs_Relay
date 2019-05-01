<template>
  <v-layout md12 my-4 row justify-space-start wrap>
    <v-flex md6 d-flex v-for="(items, type, index) in itemsByType" :key="index" pa-2 >
      <v-card>
        <v-list subheader> 
          <v-subheader>{{type}}</v-subheader>            
            <v-list-tile
              v-for="item in items"
              :key="item.title"
              avatar
              class="my-3"
            >        
            <v-img
              :src="item.logo"
              height="40px"
              max-width="100px"
              contain
              />
              <v-list-tile-content class="ml-3">
                <v-list-tile-title v-html="item.title"></v-list-tile-title>
                <v-list-tile-sub-title>Average increase: {{ Math.round((Math.random() * .15) * 100) / 100 }}%</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn v-if="!item.authorized" color="info" @click="$emit('update', item.authorized = true)"> Authorize </v-btn>
                <v-icon v-else color="success" large>check</v-icon>
              </v-list-tile-action>           
            </v-list-tile>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: {
    items: Array
  },
  computed: {
    itemsByType(){
      return this._.groupBy(this.items, item => item.type);
    }
  },
}
</script>