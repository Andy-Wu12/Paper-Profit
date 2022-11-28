
export interface SelectDropdownProps {
  options: string[]
  onChange: React.ChangeEventHandler<HTMLSelectElement>,
  formName?: string
  className?: string,
  id?: string
}

export default function SelectDropdown({options, onChange, className, id, formName}: SelectDropdownProps): React.ReactElement {
  return (
    <select name={formName} id={id} className={className} onChange={onChange}>
      {
        options.map((value: string) => {
          return <option key={`${value}-option`} value={value}> {value} </option>
        })
      }
    </select>
  )
}