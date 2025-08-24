import { ChatOpenAI, type ChatOpenAIFields } from "@langchain/openai";
import { AIMessageChunk, type BaseMessage } from "@langchain/core/messages";
import { ChatGenerationChunk } from "@langchain/core/outputs";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";

// 创建一个新类，用于处理火山引擎豆包的 API 格式
class ChatDoubao extends ChatOpenAI {
  static lc_name() {
    return "ChatDoubao";
  }

  constructor(fields?: ChatOpenAIFields) {
    super(fields);
  }

  // 重写 _convertOpenAIDeltaToBaseMessageChunk 方法来处理 reasoning_content
  protected _convertOpenAIDeltaToBaseMessageChunk(
    delta: Record<string, any>, 
    rawResponse: any, 
    defaultRole?: any
  ) {
    // 首先调用父类方法获取基础的 chunk
    const baseChunk = super._convertOpenAIDeltaToBaseMessageChunk(delta, rawResponse, defaultRole);
    
    // 如果存在 reasoning_content，将其分别存储
    if (delta.reasoning_content) {
      console.log("Found reasoning_content:", delta.reasoning_content);
      
      // 如果 baseChunk 是 AIMessageChunk，我们创建一个包含推理内容的新chunk
      if (baseChunk instanceof AIMessageChunk) {
        return new AIMessageChunk({
          content: baseChunk.content || "",
          additional_kwargs: {
            ...baseChunk.additional_kwargs,
            reasoning_content: delta.reasoning_content, // 将推理内容存储在additional_kwargs中
          },
          tool_calls: baseChunk.tool_calls,
          tool_call_chunks: baseChunk.tool_call_chunks,
          invalid_tool_calls: baseChunk.invalid_tool_calls,
          usage_metadata: baseChunk.usage_metadata,
          id: baseChunk.id,
          response_metadata: baseChunk.response_metadata,
        });
      }
    }
    
    return baseChunk;
  }

  // 如果上面的方法不工作，可以尝试重写 _streamResponseChunks
  async *_streamResponseChunks(
    messages: BaseMessage[], 
    options: any, 
    runManager?: CallbackManagerForLLMRun
  ): AsyncGenerator<ChatGenerationChunk> {
    console.log("Using custom _streamResponseChunks method");
    
    // 调用父类的流式响应方法
    const stream = super._streamResponseChunks(messages, options, runManager);

    for await (const chunk of stream) {
      // 检查原始响应数据中是否有 reasoning_content
      const rawChunk = chunk.generationInfo?.rawChunk;
      if (rawChunk?.choices?.[0]?.delta?.reasoning_content) {
        console.log("Found reasoning_content in stream:", rawChunk.choices[0].delta.reasoning_content);
        
        // 创建一个新的 ChatGenerationChunk，包含 reasoning_content
        const messageContent = chunk.message.content;
        const contentString = typeof messageContent === 'string' ? messageContent : '';
        
        const newMessage = new AIMessageChunk({
          content: contentString + rawChunk.choices[0].delta.reasoning_content,
          additional_kwargs: chunk.message.additional_kwargs,
          tool_calls: chunk.message instanceof AIMessageChunk ? chunk.message.tool_calls : [],
          id: chunk.message.id,
        });
        
        yield new ChatGenerationChunk({
          message: newMessage,
          text: typeof newMessage.content === 'string' ? newMessage.content : '',
          generationInfo: chunk.generationInfo,
        });
      } else {
        yield chunk;
      }
    }
  }
}

export default ChatDoubao;