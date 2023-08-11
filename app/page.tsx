"use client";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  ResponsiveContainer,
} from "recharts";

function DataVisualizationComponent() {
  type DataItem = {
    timestamp: number;
    decibel: number;
  };

  const [data, setData] = useState<DataItem[]>([]);
  const [lastKey, setLastKey] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      let endpoint = "/api/data";
      if (lastKey) {
        endpoint += `?startKey=${lastKey}`;
      }
      try {
        const response = await fetch(endpoint);
        console.log(response)
        if (response.status != 200) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log("not error")
        const result = await response.json();
        console.log(result, "result");
        setData(result);
        setLastKey(result.lastKey);
        console.log(data)
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Call immediately when the component mounts

    //const intervalId = setInterval(fetchData, 5000); // Then every 5 seconds

    // // Cleanup the interval when the component unmounts
    //return () => clearInterval(intervalId);
  }, [lastKey]); // This effect will run every time lastKey changes

  // ...

  return (
  <div className="h-screen w-screen bg-[#272822] flex flex-col items-center justify-center">
  <h1 className="text-center text-[#f92672] font-bold text-2xl mb-4 mt-4">Sound Intensity Analysis</h1>
      <ResponsiveContainer width="90%" height="90%" className="mt-8">
      <LineChart
          data={data.sort((a, b) => a.timestamp - b.timestamp)}
          margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
      >
          <Line type="monotone" dataKey="decibel" stroke="#f92672" strokeWidth={3}  />
          <CartesianGrid stroke="#75715E" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(unixTime) =>
              new Date(unixTime * 1000).toLocaleTimeString()
            }
            stroke="#f8f8f2"
          >
            <Label
              value="Time"
              offset={-10}
              position="insideBottom"
              style={{ fill: "#f8f8f2" }}
            />
          </XAxis>
          <YAxis width={80} stroke="#f8f8f2">
            <Label
              value="Decibel"
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: "middle", fill: "#f8f8f2" }}
            />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          <Label
            value="Decibel Levels Over Time"
            position="top"
            style={{ fontSize: "20px", textAnchor: "middle", fill: "#f8f8f2" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({ payload, label, active }) {
  if (active && payload && payload.length) {
    const date = new Date(label * 1000);
    return (
      <div className="bg-[#3E3D32] p-3 border border-[#75715E] text-[#f8f8f2]">
        <p className="label">{`Time: ${date.toLocaleString()}`}</p>
        <p className="desc">{`Decibel: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
}

export default DataVisualizationComponent;
