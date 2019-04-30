<template>
  <v-layout my-4 row justify-space-start wrap>  
    <v-chip
      v-for="(item, index) in itemsByAuthorized"
      :key="index"
      label
      class="px-3 py-1 body-2"
      close
      v-model="item.authorized"
      color="teal"
      outline
    >
    {{item.title}}
    </v-chip>
  </v-layout>

</template>

<script>

  export default {
    props: {
      items: Array
    },
    computed: {
      itemsByAuthorized(){
        return this.items.filter(item => item.authorized)
      }
    },

 
  }
</script>