import Control from './Control'
import Preview from './Preview'

if (typeof window !== 'undefined') {

    window.StarterControl = Control
    window.StarterPreview = Preview
}

if (!import.meta.env.PROD) {
    console.log('[decap-cms-widget-starter] Running in development mode...')
    import("./dev.ts")
}

export {
    Control as StarterControl,
    Preview as StarterPreview
}