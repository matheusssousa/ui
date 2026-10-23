/** Whether focus belongs to a field, including its portaled picker. */
export function containsFieldFocus(container: HTMLElement | null, target: Element | null): boolean {
  if (!container || !target) return false;
  if (container.contains(target)) return true;
  const owner = target.closest('[data-input-portal]')?.getAttribute('data-input-portal');
  return Boolean(owner && Array.from(container.querySelectorAll('[data-input-owner]'))
    .some(field => field.getAttribute('data-input-owner') === owner));
}
