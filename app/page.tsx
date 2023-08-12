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
  const [theme, setTheme] = useState<string>("dark");
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
  useEffect(() => {
    // Fetch user's preferred theme from local storage on component mount
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Save theme changes to local storage
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
      let endpoint = "/api/data";
      if (lastKey) {
        endpoint += `?startKey=${lastKey}`;
      }
      try {
        const response = await fetch(endpoint);
        console.log(response);
        if (response.status != 200) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log("not error");
        const result = await response.json();
        console.log(result, "result");
        setData(result);
        setLastKey(result.lastKey);
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Call immediately when the component mounts

    const intervalId = setInterval(fetchData, 1000); // Then every 5 seconds

    // // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [lastKey]); // This effect will run every time lastKey changes

  const bgColor = theme === "light" ? "bg-white" : "bg-[#272822]";
  const textColor = theme === "light" ? "text-black" : "text-[#f8f8f2]";
  const secondaryColor = theme === "light" ? "text-gray-700" : "text-[#f92672]";
  const borderColor =
    theme === "light" ? "border-gray-300" : "border-[#75715E]";
  const chartStroke = theme === "light" ? "#333" : "#f92672";
  const gridColor = theme === "light" ? "#ddd" : "#75715E";
  const axisColor = theme === "light" ? "#555" : "#f8f8f2";

  return (
    <div
      className={`${bgColor} ${textColor} h-screen w-screen flex flex-col items-center justify-center px-4`}
    >
      <div className="flex items-center justify-center mb-4 mt-4">
        <h1 className="text-center text-[#f92672] font-bold text-xl sm:text-2xl mr-4">
          Sound Intensity Analysis
        </h1>
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-lg p-1 rounded-sm bg-transparent"
          color="primary"
        >
          <img
            width={25}
            alt="Sun or Moon"
            src={theme === "light" ? `./sun.svg` : `./moon.svg`}
          />
        </button>
      </div>

      <div className="max-w-9/10 w-full">
        <p
          className={`${textColor} text-center mb-6 mx-2 sm:mx-6 text-sm sm:text-base`}
        >
          This system employs a MAX9814 microphone attached to an ESP32
          microcontroller. When a sound is detected, the ESP32 initiates an MQTT
          publishing request to the AWS IoT broker. This data is then stored
          persistently in DynamoDB. To visualize this sound data, a GET request
          is dispatched every few seconds to fetch the latest entries, updating
          the graph below in real-time.
        </p>
        <ResponsiveContainer
          width="100%"
          height={300}
          className="chart-container mt-8"
        >
          <LineChart
            data={data.sort((a, b) => a.timestamp - b.timestamp)}
            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
          >
            <Line
              type="monotone"
              dataKey="decibel"
              stroke={chartStroke}
              strokeWidth={3}
            />
            <CartesianGrid stroke={gridColor} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(unixTime) =>
                new Date(unixTime * 1000).toLocaleTimeString()
              }
              stroke={axisColor}
            >
              <Label
                value="Time"
                offset={-10}
                position="insideBottom"
                style={{ fill: axisColor }}
              />
            </XAxis>
            <YAxis width={80} stroke={axisColor}>
              <Label
                value="Decibel"
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: "middle", fill: axisColor }}
              />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Label
              value="Decibel Levels Over Time"
              position="top"
              style={{
                fontSize: "20px",
                textAnchor: "middle",
                fill: axisColor,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
type CustomTooltipProps = {
  payload?: any;
  label?: any;
  active?: any;
};
function CustomTooltip({ payload, label, active }: CustomTooltipProps) {
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
