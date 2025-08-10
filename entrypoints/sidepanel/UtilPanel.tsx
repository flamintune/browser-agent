import { SelectOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";


export default function UtilPanel() {
  const handlePick = ()=>{
    // 发消息给 content.ts
  }
    return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 8px",
        minHeight: "20px",
      }}
    >
      <Tooltip title="选择元素" placement="right">
        <SelectOutlined
          style={{ fontSize: "16px", cursor: "pointer" }}
          onClick={() => {

          }}
        />
      </Tooltip>
    </div>
  );
}
