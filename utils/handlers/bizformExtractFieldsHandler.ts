import { messageRequest, messageResponse } from "../types/message";

export const bizformExtractFieldsHandler = (
  message: messageRequest
): messageResponse => {
  const fields = extractAllFormFields();
  const jsonString = JSON.stringify(fields);
  return {
    result: jsonString,
  };
};

interface FieldInfo {
  fieldId: string;
  label: string;
  value: string;
  options: string[];
}

export function extractAllFormFields(): FieldInfo[] {
  const results: FieldInfo[] = [];

  // 第一類型：.column-wrapper.is-fields-h 結構
  const wrappers = document.querySelectorAll<HTMLElement>(
    ".column-wrapper.is-fields-h"
  );
  wrappers.forEach((row, index) => {
    const fieldId = row.id || `field_a_${index + 1}`;
    const labelDiv = row.querySelector<HTMLElement>(".bizf_field-header");
    const labelTextarea =
      labelDiv?.querySelector<HTMLTextAreaElement>("textarea");
    const label =
      labelTextarea?.value?.trim() ||
      labelDiv?.textContent?.trim() ||
      `欄位 A-${index + 1}`;
    const valueField = row.querySelector<HTMLElement>(
      ".bizf_field:not(.bizf_field-header)"
    );
    if (!valueField) return;

    const { value, options } = extractFieldValueAndOptions(valueField);
    results.push({ fieldId, label, value, options });
  });

  // 第二類型：.columns-title + .column-content 結構
  const labelNodes = document.querySelectorAll<HTMLElement>(".columns-title");
  labelNodes.forEach((labelNode, index) => {
    const label = labelNode.textContent?.trim() || `欄位 B-${index + 1}`;
    const fieldId = `field_b_${index + 1}`;
    const valueNode = labelNode.nextElementSibling as HTMLElement | null;
    if (!valueNode || !valueNode.classList.contains("column-content")) return;
    const fieldContainer =
      valueNode.querySelector<HTMLElement>(".detail-edit-content") || valueNode;

    const { value, options } = extractFieldValueAndOptions(fieldContainer);
    results.push({ fieldId, label, value, options });
  });
  console.log(results);
  return results;
}

function extractFieldValueAndOptions(container: HTMLElement): {
  value: string;
  options: string[];
} {
  let value = "";
  const options: string[] = [];

  // 單一輸入 input 或 textarea
  const inputEl = container.querySelector<
    HTMLInputElement | HTMLTextAreaElement
  >("input[type='text'], textarea");
  if (inputEl && inputEl.value?.trim()) {
    value = inputEl.value.trim();
  }

  // checkbox group
  const checkboxes = container.querySelectorAll<HTMLInputElement>(
    "input[type='checkbox']"
  );
  if (checkboxes.length > 0) {
    const checked = Array.from(checkboxes).filter((cb) => cb.checked);
    value = checked
      .map((cb) => {
        const lbl = cb
          .closest("label")
          ?.querySelector<HTMLElement>(".el-checkbox__label")?.textContent;
        return lbl?.trim() || cb.value;
      })
      .join(", ");

    Array.from(checkboxes).forEach((cb) => {
      const lbl = cb
        .closest("label")
        ?.querySelector<HTMLElement>(".el-checkbox__label")?.textContent;
      const opt = lbl?.trim();
      if (opt && !options.includes(opt)) options.push(opt);
    });
  }

  // radio group
  const radios = container.querySelectorAll<HTMLInputElement>(
    "input[type='radio']"
  );
  if (radios.length > 0) {
    const checked = Array.from(radios).find((rb) => rb.checked);
    if (checked) {
      const lbl = checked
        .closest("label")
        ?.querySelector<HTMLElement>(".el-radio__label")?.textContent;
      value = lbl?.trim() || checked.value;
    }

    Array.from(radios).forEach((rb) => {
      const lbl = rb
        .closest("label")
        ?.querySelector<HTMLElement>(".el-radio__label")?.textContent;
      const opt = lbl?.trim();
      if (opt && !options.includes(opt)) options.push(opt);
    });
  }

  // element-select 的模擬 input
  const selectInput = container.querySelector<HTMLInputElement>(
    "input.el-input__inner[readonly]"
  );
  if (selectInput && selectInput.value?.trim()) {
    value = selectInput.value.trim();
  }

  return { value, options };
}
