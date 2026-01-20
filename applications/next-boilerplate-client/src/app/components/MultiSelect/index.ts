/**
 * MultiSelect Component - Public API
 *
 * Usage:
 * import { MultiSelect } from '@/components/MultiSelect';
 *
 * <MultiSelect options={... } value={...} onChange={...}>
 *   <MultiSelect.Trigger />
 *   <MultiSelect.Content>
 *     <MultiSelect.Search />
 *     <MultiSelect.SelectAll />
 *     <MultiSelect.OptionsList />
 *     <MultiSelect.Footer />
 *   </MultiSelect.Content>
 * </MultiSelect>
 */

export { MultiSelect } from './MultiSelect'
export { useMultiSelectContext } from './MultiSelectContext'
export type { MultiSelectProps, BaseOption, MultiSelectContextValue } from './types'
