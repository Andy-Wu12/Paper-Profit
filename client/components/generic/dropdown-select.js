
export default function SelectDropdown({options, onChange, className, id, formName}) {
  return (
    <select name={formName} id={id} className={className} onChange={onChange}>
      {
        options.map((value) => {
          return <option value={value}> {value} </option>
        })
      }
    </select>
  )
}