<script>
    import { onMount } from "svelte";
    import PhotoSwipeLightbox from 'photoswipe/lightbox';
    import 'photoswipe/style.css';
    export let galleryID;
    export let images;
    
    onMount(() => {
        let lightbox = new PhotoSwipeLightbox({
            gallery: '#' + galleryID,
            children: 'a',
            pswpModule: () => import('photoswipe'),
        });
        lightbox.init();
    })
</script>
    
<div class="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 m-2" id={galleryID}>
    {#each images as image}
    <a
        href={image.url}
        data-pswp-width={image.width}
        data-pswp-height={image.height}
        target="_blank"
        rel="noreferrer"
    >
    <div class="rounded-xl overflow-hidden">
        <img src={image.thumb} alt="" />
    </div>
    </a>
    {/each}
</div>
    