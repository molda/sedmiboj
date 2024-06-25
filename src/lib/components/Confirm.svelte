<script>
    import { fly, fade } from 'svelte/transition';
    export let confirmTitle = 'Ok';
    export let cancelTitle = 'Zrušit';
  
    let showDialog = false;
    let functionToCall = {
      func: null,
      args: null
    };
  
    function callFunction () {
      showDialog = false;
      functionToCall['func'](...functionToCall['args']);
    }
  
    function confirm (func, ...args) {
      functionToCall = {func, args};
      showDialog = true;
    }
  </script>
  
  <slot confirm={confirm}></slot>
  
  {#if showDialog}
    <div class="fixed inset-0 bg-black bg-opacity-10 z-50 flex justify-center items-center">
        <div class="bg-white rounded-xl p-6 w-[32rem]" in:fly="{{ y: -10, delay: 200, duration: 200 }}" out:fly="{{ y: -10, duration: 200 }}">
            <h2 class="text-2xl font-bold mb-4"><slot name="title"></slot></h2>
            <p class="text-lg text-gray-600"><slot name="description"></slot></p>

            <div class="flex justify-end">
                <button class="" type="button" on:click={() => (showDialog = false)}><slot name="cancel">{cancelTitle}</slot></button>
                <button class="inline-flex justify-center items-center rounded-lg text-sm font-semibold py-3 px-4 bg-primary-700 text-white hover:bg-primary-600 shadow-2xl ml-2" on:click="{callFunction}">{confirmTitle}</button>
            </div>
        </div>
    </div>
  {/if}