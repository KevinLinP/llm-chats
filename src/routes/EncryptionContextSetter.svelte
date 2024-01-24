<script>
	import { setContext } from "svelte";

  export let encryptionKey;

  setContext('encryptionKey', encryptionKey);
</script>

<slot/>