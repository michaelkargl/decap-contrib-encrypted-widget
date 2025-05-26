// Codes below will not be included when running in "production" mode.
import CMS from "decap-cms-app";

CMS.init();

window.CMS_MANUAL_INIT = true;
CMS.registerWidget('test', window.StarterControl, window.StarterPreview);