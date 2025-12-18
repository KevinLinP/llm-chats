<script>
  import { db } from '$lib/firestore';
  import { doc, setDoc } from 'firebase/firestore';
  import { getUser } from '$lib/user';

	let apiKey = $state('loading...');

  let user = $state(null);
  $effect(async () => {
    user = await getUser();
    apiKey = user?.openRouter?.apiKey;
  });

  // TODO: move to user.js
	const save = () => {
    if (!user) return;
		setDoc(
      doc(db, 'users', user.id),
      { openRouter: { apiKey } }, { merge: true }
    );
	};
</script>

<div class="mb-2">
	<label for="openrouter-key" class="form-label">openRouter.apiKey</label>

	<input type="text" id="openrouter-key" class="form-control" bind:value={apiKey} onblur={save} />
</div>

<a href="https://openrouter.ai/credits" target="_blank">OpenRouter Usage ⌝</a>
