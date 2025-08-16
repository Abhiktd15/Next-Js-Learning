"use client"
import { useState } from "react";

export default function Home() {
  const [message,setMessage] = useState("")
  const [response,setResponse] = useState("")
  const [streaming,setStreaming] = useState("")
  const [loading,setLoading] = useState("")
  const [streamResponse,setStreamResponse] = useState("")

  const handleChat = async () =>{
    setLoading(true)
    setResponse("")

    try {
      const res  = await fetch("/api/chat",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({message})
      })
      const data = await res.json();
      setResponse(data.response)
    } catch (error) {
      setResponse("Error : " + error.message)
    }finally{
      setLoading(false)
    }

  }
  const handleStreamChat = async() => {
    setStreaming(true)
    setStreamResponse("")

    try {
      const res = await fetch("/api/chat-stream",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body: JSON.stringify({message})
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      
      while(true){
        const {done,value} = await reader.read()
        if(done) break;
        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")
        for(const line of lines){
          if(line.startsWith("data: ")){
            const data = JSON.parse(line.slice(6))
            setStreamResponse((prev) => prev + data.content)
          }
        }
      }
      
    } catch (error) {
      setStreamResponse("Error: " + error.message)
    }finally{
      setStreaming(false)
    }
  }
  
  return (
    <div className="font-sans max-w-6xl mx-auto p-20 ">
      <h1 className="text-3xl font-bold mb-10 text-center">Get Started with Next js and AI</h1>
      <h1 className="text-xl font-semibold mb-10 text-center">Difference between Normal Response VS Stream Chat Response...</h1>
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your awesome message"
          rows={4}
          cols={60}
          className="w-full mb-2 bg-gray-100 text-xl text-black p-4 rounded-2xl "
        />
      </div>
      <div className="flex items-center justify-end gap-4  mb-4 w-full">
        <button
          onClick={handleChat}
          className="py-3 px-5 rounded-xl hover:scale-110 hover:bg-orange-400 hover:cursor-pointer bg-orange-500"> 
            {loading ? "Loading...":"Chat"}
        </button>
        <button
          onClick={handleStreamChat}
          className="py-3 px-5 rounded-xl hover:scale-110 hover:bg-green-400 hover:cursor-pointer bg-green-500"> 
            {streaming ? "Loading...":"Stream Chat"}
        </button>
      </div>
      {/* Response Area */}
      <div className="border border-[#ccc] whitespace-pre-wrap text-xl rounded-xl px-8 py-4 min-h-40 mb-10 shadow-md shadow-gray-800" >
        <h3 className="text-lg font-bold mb-2 text-orange-500">Chat Response</h3>
        {response}
      </div>
      {/* Stream Response Area */}
      <div className="border border-[#ccc]  whitespace-pre-wrap text-xl py-4 px-8 min-h-40 rounded-xl shadow-md shadow-gray-800" >
        <h3 className="text-lg font-bold mb-2 text-green-500">Stream Chat Response</h3>
        {streamResponse}
      </div>
    </div>
  );
}
