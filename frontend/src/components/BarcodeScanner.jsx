import { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function BarcodeScanner({ onScan }) {
  const [scanner, setScanner] = useState(null);

  const startScanner = () => {
    const htmlScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 }
    );

    htmlScanner.render((decodedText) => {
      onScan(decodedText);
      htmlScanner.clear();
    });

    setScanner(htmlScanner);
  };

  return (
    <div>
      <button onClick={startScanner}>
        Start Barcode Scan
      </button>

      <div id="reader"></div>
    </div>
  );
}