<Map :map bind:center zoom=11 />
<p>Center: {{center}}</p>
 
<script>
  import { Context } from 'svelte-google-maps'; 
  import Map from 'svelte-google-maps/Map.html';
 
  export default {
    components: { Map },
    data() {
      return {
        map: new Context('your-api-key'),
        center: { lat: 37.540725, lng: -77.436048 }
      }
    }
  }
</script> 