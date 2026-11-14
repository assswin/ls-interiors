
import { useState } from 'react'

import {
  calculateSlidingWindow,
  type SlidingModelId,
  type MeasurementUnit,
  type SlidingCalculationResult,
} from '../utils/slidingCalculations'

type SlidingModel = {
  id: SlidingModelId
  name: string
  material: string
  shortCode: string
}

const slidingModels: SlidingModel[] = [
  { id: '58-2', name: '2 Track Sliding Window – 58 mm', material: '58 mm', shortCode: 'SL/SL' },
  { id: '58-2.5', name: '2.5 Track Sliding Window – 58 mm', material: '58 mm', shortCode: 'SL/SL/MESH' },
  { id: '58-3', name: '3 Track Sliding Window – 58 mm', material: '58 mm', shortCode: 'SL/SL/SL' },
  { id: '58-4', name: '4 Track Sliding Window – 58 mm', material: '58 mm', shortCode: 'SL/SL/SL/SL' },
  { id: '66-2', name: '2 Track Sliding Window – 66 mm', material: '66 mm', shortCode: 'SL/SL' },
  { id: '66-3', name: '3 Track Sliding Window – 66 mm', material: '66 mm', shortCode: 'SL/SL/SL' },
]

type RowUnit = 'in' | 'cm' | 'mm'

type FractionOption = {
  label: string
  numerator: number
  denominator: number
}

const fractionOptions: FractionOption[] = [
  { label: '1/8', numerator: 1, denominator: 8 },
  { label: '2/8', numerator: 2, denominator: 8 },
  { label: '3/8', numerator: 3, denominator: 8 },
  { label: '4/8', numerator: 4, denominator: 8 },
  { label: '5/8', numerator: 5, denominator: 8 },
  { label: '6/8', numerator: 6, denominator: 8 },
  { label: '7/8', numerator: 7, denominator: 8 },
  { label: '1/5', numerator: 1, denominator: 5 },
  { label: '1/4', numerator: 1, denominator: 4 },
  { label: '1/3', numerator: 1, denominator: 3 },
  { label: '1/2', numerator: 1, denominator: 2 },
  { label: '2/3', numerator: 2, denominator: 3 },
  { label: '3/4', numerator: 3, denominator: 4 },
]

const identificationColors = [
  '#FDE68A',
  '#BFDBFE',
  '#BBF7D0',
  '#FBCFE8',
  '#DDD6FE',
  '#FED7AA',
  '#A5F3FC',
  '#E5E7EB',
]

type MeasurementRow = {
  id: number
  height: string
  width: string
  modelId: string
  glassType: string
  toleranceMm: number
  applyTolerance: boolean
  heightAdditionalMm: number
  widthAdditionalMm: number
  identificationColor: string
}

const createEmptyRow = (
  id: number,
  toleranceMm: number,
  applyTolerance: boolean,
  identificationColor: string
): MeasurementRow => ({
  id,
  height: '',
  width: '',
  modelId: '',
  glassType: '',
  toleranceMm,
  applyTolerance,
  heightAdditionalMm: 0,
  widthAdditionalMm: 0,
  identificationColor,
})

const unitLabels: Record<RowUnit, string> = {
  in: 'Inches',
  cm: 'CM',
  mm: 'MM',
}

const unitShortLabels: Record<RowUnit, string> = {
  in: 'in',
  cm: 'cm',
  mm: 'mm',
}

const convertToMm = (value: number, unit: RowUnit): number => {
  switch (unit) {
    case 'in':
      return value * 25.4
    case 'cm':
      return value * 10
    case 'mm':
      return value
  }
}

const convertFromMm = (valueMm: number, unit: RowUnit): number => {
  switch (unit) {
    case 'in':
      return valueMm / 25.4
    case 'cm':
      return valueMm / 10
    case 'mm':
      return valueMm
  }
}

const convertValue = (
  value: number,
  fromUnit: RowUnit,
  toUnit: RowUnit
): number => {
  return convertFromMm(convertToMm(value, fromUnit), toUnit)
}

const formatStoredValue = (value: number): string => {
  return Number(value.toFixed(4)).toString()
}

const formatCutValue = (
  value: number | null | undefined,
  unit: RowUnit
): string => {
  if (value === null || value === undefined) {
    return '-'
  }

  const convertedValue = convertFromMm(value, unit)

  if (unit === 'mm') {
    return String(Math.round(convertedValue))
  }

  return Number(convertedValue.toFixed(2)).toString()
}

function Measurements() {
  const [defaultTolerance, setDefaultTolerance] = useState(5)
  const [defaultApplyTolerance, setDefaultApplyTolerance] = useState(true)

  const [fromUnit, setFromUnit] = useState<RowUnit>('in')
  const [toUnit, setToUnit] = useState<RowUnit>('mm')

  const [rows, setRows] = useState<MeasurementRow[]>([
    createEmptyRow(1, 5, true, identificationColors[0]),
  ])

  const getNextRowId = (currentRows: MeasurementRow[]) => {
    return Math.max(0, ...currentRows.map((row) => row.id)) + 1
  }

  const getNextColor = (currentRows: MeasurementRow[]) => {
    const usedColors = currentRows.map(
      (row) => row.identificationColor.toUpperCase()
    )

    return (
      identificationColors.find(
        (color) => !usedColors.includes(color.toUpperCase())
      ) ?? identificationColors[currentRows.length % identificationColors.length]
    )
  }

  const addRow = () => {
    setRows((currentRows) => [
      ...currentRows,
      createEmptyRow(
        getNextRowId(currentRows),
        defaultTolerance,
        defaultApplyTolerance,
        getNextColor(currentRows)
      ),
    ])
  }

  const copyRow = (id: number) => {
    setRows((currentRows) => {
      const originalIndex = currentRows.findIndex((row) => row.id === id)

      if (originalIndex === -1) return currentRows

      const originalRow = currentRows[originalIndex]

      const copiedRow: MeasurementRow = {
        ...originalRow,
        id: getNextRowId(currentRows),
      }

      const updatedRows = [...currentRows]
      updatedRows.splice(originalIndex + 1, 0, copiedRow)

      return updatedRows
    })
  }

  const updateRow = <K extends keyof MeasurementRow>(
    id: number,
    field: K,
    value: MeasurementRow[K]
  ) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    )
  }

  const deleteRow = (id: number) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== id))
  }

  // Show the Mesh columns only when at least one 2.5 Track is selected.
  const showMeshColumn = rows.some((row) => row.modelId === '58-2.5')

  // Changing From converts existing entries without changing
  // the actual physical dimensions of the windows.
  const handleFromUnitChange = (newUnit: RowUnit) => {
    if (newUnit === fromUnit) return

    setRows((currentRows) =>
      currentRows.map((row) => ({
        ...row,
        height: row.height.trim()
          ? formatStoredValue(
              convertValue(Number(row.height), fromUnit, newUnit)
            )
          : '',
        width: row.width.trim()
          ? formatStoredValue(
              convertValue(Number(row.width), fromUnit, newUnit)
            )
          : '',
      }))
    )

    setFromUnit(newUnit)
  }

  const applyFraction = (
    row: MeasurementRow,
    dimension: 'height' | 'width',
    selectedFraction: string
  ) => {
    const fraction = fractionOptions.find(
      (option) => option.label === selectedFraction
    )

    if (!fraction) return

    const currentValue = Number(row[dimension] || 0)

    if (!Number.isFinite(currentValue)) return

    const wholeNumber = Math.trunc(currentValue)
    const fractionInInches = fraction.numerator / fraction.denominator

    const fractionInCurrentUnit = convertValue(
      fractionInInches,
      'in',
      fromUnit
    )

    const updatedValue = Number(
      (wholeNumber + fractionInCurrentUnit).toFixed(4)
    )

    const isEighthFraction = fraction.denominator === 8

    setRows((currentRows) =>
      currentRows.map((currentRow) => {
        if (currentRow.id !== row.id) return currentRow

        if (dimension === 'height') {
          return {
            ...currentRow,
            height: String(updatedValue),
            heightAdditionalMm: isEighthFraction ? 3.5 : 0,
          }
        }

        return {
          ...currentRow,
          width: String(updatedValue),
          widthAdditionalMm: isEighthFraction ? 3.5 : 0,
        }
      })
    )
  }

  const getRowCalculation = (
    row: MeasurementRow
  ): SlidingCalculationResult | null => {
    if (!row.modelId || !row.height.trim() || !row.width.trim()) {
      return null
    }

    const height = Number(row.height)
    const width = Number(row.width)

    if (
      !Number.isFinite(height) ||
      !Number.isFinite(width) ||
      height <= 0 ||
      width <= 0
    ) {
      return null
    }

    const calculationUnit: MeasurementUnit =
      fromUnit === 'in'
        ? 'inches'
        : fromUnit === 'cm'
          ? 'cm'
          : 'mm'

    return calculateSlidingWindow({
      modelId: row.modelId as SlidingModelId,
      height,
      width,
      unit: calculationUnit,
      toleranceMm: row.toleranceMm,
      applyTolerance: row.applyTolerance,
      heightAdditionalMm: row.heightAdditionalMm,
      widthAdditionalMm: row.widthAdditionalMm,
    })
  }

  const modelSummary = slidingModels
    .map((model) => ({
      ...model,
      quantity: rows.filter((row) => row.modelId === model.id).length,
    }))
    .filter((model) => model.quantity > 0)

  const unselectedModelCount = rows.filter((row) => !row.modelId).length

  return (
    <section className="measurement-workspace">
      <div className="measurement-toolbar">
        <div>
          <h2>Sliding Window Measurements</h2>
          <p>Select a model and enter the measurements for each window.</p>
        </div>

        <button type="button" onClick={addRow}>
          + Add Window
        </button>
      </div>

      <div className="tolerance-settings">
        <div>
          <h3>Outer Frame Tolerance</h3>
          <p>Default tolerance for newly added windows.</p>
        </div>

        <label>
          Tolerance (mm)
          <input
            type="number"
            step="any"
            value={defaultTolerance}
            onChange={(e) =>
              setDefaultTolerance(
                e.target.value === '' ? 0 : Number(e.target.value)
              )
            }
          />
        </label>

        <label className="tolerance-checkbox">
          <input
            type="checkbox"
            checked={defaultApplyTolerance}
            onChange={(e) => setDefaultApplyTolerance(e.target.checked)}
          />
          Apply tolerance
        </label>

        <div className="unit-conversion-control">
          <span className="unit-conversion-title">Unit Conversion</span>

          <label>
            From
            <select
              value={fromUnit}
              onChange={(e) =>
                handleFromUnitChange(e.target.value as RowUnit)
              }
            >
              <option value="in">Inches</option>
              <option value="cm">CM</option>
              <option value="mm">MM</option>
            </select>
          </label>

          <span className="unit-conversion-arrow">→</span>

          <label>
            To
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value as RowUnit)}
            >
              <option value="in">Inches</option>
              <option value="cm">CM</option>
              <option value="mm">MM</option>
            </select>
          </label>
        </div>
      </div>

      <div className="measurement-order-details">
        <label>
          Customer Name
          <input type="text" placeholder="Enter customer name" />
        </label>

        <label>
          Project / Order Name
          <input type="text" placeholder="Enter project name" />
        </label>
      </div>

      <div className="measurement-table-wrapper">
        <table className="measurement-table">
          <thead>
            <tr>
              <th rowSpan={2}>S.No</th>
              <th rowSpan={2}>Identification Colour</th>

              <th rowSpan={2}>
                Height × Width
                <br />
                <span className="table-unit-note">
                  Enter in {unitLabels[fromUnit]}
                </span>
              </th>

              <th rowSpan={2}>
                Outer Frame ({unitShortLabels[toUnit]})
                <br />
                (H × W)
              </th>

              <th colSpan={2}>Model Details</th>

              <th colSpan={4}>
                Sash Cut ({unitShortLabels[toUnit]})
              </th>

              <th rowSpan={2}>
                Interlock ({unitShortLabels[toUnit]})
              </th>

              {showMeshColumn && (
                <th colSpan={2}>
                  Mesh Cut ({unitShortLabels[toUnit]})
                </th>
              )}

              <th colSpan={3}>
                Glass Cut ({unitShortLabels[toUnit]})
              </th>

              <th rowSpan={2}>Glass Type</th>
              <th rowSpan={2}>Action</th>
            </tr>

            <tr className="sub-heading">
              <th>Model Name</th>
              <th>Material</th>

              <th>H</th>
              <th>W</th>
              <th>H Pcs</th>
              <th>W Pcs</th>

              {showMeshColumn && (
                <>
                  <th>H</th>
                  <th>W</th>
                </>
              )}

              <th>H</th>
              <th>W</th>
              <th>Quantity</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => {
              const selectedModel = slidingModels.find(
                (model) => model.id === row.modelId
              )

              const calculation = getRowCalculation(row)

              return (
                <tr key={row.id}>
                  <td>{index + 1}</td>

                  <td>
                    <label className="identification-color-control">
                      <span
                        className="identification-color-preview"
                        style={{
                          backgroundColor: row.identificationColor,
                        }}
                      />

                      <input
                        type="color"
                        aria-label={`Window ${index + 1} identification colour`}
                        value={row.identificationColor}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            'identificationColor',
                            e.target.value
                          )
                        }
                      />
                    </label>
                  </td>

                  <td className="dimension-cell">
                    <div className="dimension-horizontal">
                      <div className="dimension-item">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="Height"
                          value={row.height}
                          onChange={(e) => {
                            updateRow(row.id, 'height', e.target.value)
                            updateRow(row.id, 'heightAdditionalMm', 0)
                          }}
                        />

                        <select
                          aria-label="Height fraction"
                          value=""
                          onChange={(e) =>
                            applyFraction(row, 'height', e.target.value)
                          }
                        >
                          <option value="" disabled>+ Fraction</option>
                          {fractionOptions.map((fraction) => (
                            <option key={fraction.label} value={fraction.label}>
                              +{fraction.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <span className="dimension-x">×</span>

                      <div className="dimension-item">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="Width"
                          value={row.width}
                          onChange={(e) => {
                            updateRow(row.id, 'width', e.target.value)
                            updateRow(row.id, 'widthAdditionalMm', 0)
                          }}
                        />

                        <select
                          aria-label="Width fraction"
                          value=""
                          onChange={(e) =>
                            applyFraction(row, 'width', e.target.value)
                          }
                        >
                          <option value="" disabled>+ Fraction</option>
                          {fractionOptions.map((fraction) => (
                            <option key={fraction.label} value={fraction.label}>
                              +{fraction.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </td>

                  <td>
                    {calculation
                      ? `${formatCutValue(calculation.outerFrameHeight, toUnit)} × ${formatCutValue(calculation.outerFrameWidth, toUnit)}`
                      : '-'}
                  </td>

                  <td>
                    <select
                      value={row.modelId}
                      onChange={(e) =>
                        updateRow(row.id, 'modelId', e.target.value)
                      }
                    >
                      <option value="">Select Model</option>

                      {slidingModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>{selectedModel ? selectedModel.material : '-'}</td>

                  <td>
                    {calculation
                      ? formatCutValue(calculation.sashHeight, toUnit)
                      : '-'}
                  </td>

                  <td>
                    {calculation
                      ? formatCutValue(calculation.sashWidth, toUnit)
                      : '-'}
                  </td>

                  <td>
                    {calculation ? calculation.sashHeightPieces : '-'}
                  </td>

                  <td>
                    {calculation ? calculation.sashWidthPieces : '-'}
                  </td>

                  <td>
                    {calculation
                      ? formatCutValue(calculation.interlock, toUnit)
                      : '-'}
                  </td>

                  {showMeshColumn && (
                    <>
                      <td>
                        {row.modelId === '58-2.5' && calculation
                          ? formatCutValue(calculation.meshHeight, toUnit)
                          : '-'}
                      </td>

                      <td>
                        {row.modelId === '58-2.5' && calculation
                          ? formatCutValue(calculation.meshWidth, toUnit)
                          : '-'}
                      </td>
                    </>
                  )}

                  <td>
                    {calculation
                      ? formatCutValue(calculation.glassHeight, toUnit)
                      : '-'}
                  </td>

                  <td>
                    {calculation
                      ? formatCutValue(calculation.glassWidth, toUnit)
                      : '-'}
                  </td>

                  <td>-</td>

                  <td>
                    <input
                      type="text"
                      placeholder="Glass type"
                      value={row.glassType}
                      onChange={(e) =>
                        updateRow(row.id, 'glassType', e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <div className="row-action-buttons">
                      <button
                        type="button"
                        className="copy-row-button"
                        onClick={() => copyRow(row.id)}
                      >
                        Copy
                      </button>

                      <button
                        type="button"
                        className="delete-row-button"
                        onClick={() => deleteRow(row.id)}
                        disabled={rows.length === 1}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* WINDOW SUMMARY */}
      <div className="window-summary">
        <div className="window-summary-header">
          <div>
            <h3>Window Summary</h3>
            <p>Actual window quantity grouped by model.</p>
          </div>

          <div className="window-summary-total">
            <span>Total Windows</span>
            <strong>{rows.length}</strong>
          </div>
        </div>

        <div className="measurement-table-wrapper">
          <table className="measurement-table window-summary-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Window Model</th>
                <th>Material</th>
                <th>Short Code</th>
                <th>Window Quantity</th>
              </tr>
            </thead>

            <tbody>
              {modelSummary.map((model, index) => (
                <tr key={model.id}>
                  <td>{index + 1}</td>
                  <td>{model.name}</td>
                  <td>{model.material}</td>
                  <td>{model.shortCode}</td>
                  <td>{model.quantity}</td>
                </tr>
              ))}

              {unselectedModelCount > 0 && (
                <tr>
                  <td>{modelSummary.length + 1}</td>
                  <td>Model Not Selected</td>
                  <td>-</td>
                  <td>-</td>
                  <td>{unselectedModelCount}</td>
                </tr>
              )}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={5}>No windows added yet.</td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr>
                <th colSpan={4}>Total Windows</th>
                <th>{rows.length}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="measurement-footer">
        <span>{rows.length} window row(s)</span>
      </div>
    </section>
  )
}

export default Measurements
