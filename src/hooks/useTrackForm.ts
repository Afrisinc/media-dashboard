import { trackEvent } from "@/lib/analytics";

export function useTrackForm(formId: string, formName: string) {
  const onStart = () =>
    trackEvent("form_start", { form_id: formId, form_name: formName });
  const onSubmit = () =>
    trackEvent("form_submit", { form_id: formId, form_name: formName });
  const onError = (field: string, type = "validation") =>
    trackEvent("form_error", {
      form_id: formId,
      error_type: type,
      field,
    });

  return { onStart, onSubmit, onError };
}
