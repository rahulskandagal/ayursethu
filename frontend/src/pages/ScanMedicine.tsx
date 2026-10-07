import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Camera, ScanLine } from "lucide-react";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ErrorState } from "../components/ui/Feedback";

export default function ScanMedicine() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

  async function lookup(code: string) {
    setLookingUp(true);
    setError(null);
    try {
      const { data } = await api.get(`/medicines/by-code/${encodeURIComponent(code)}`);
      navigate(`/medicines/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLookingUp(false);
    }
  }

  async function startScanning() {
    setError(null);
    setScanning(true);
    try {
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result) {
          controls.stop();
          setScanning(false);
          lookup(result.getText());
        }
      });
      controlsRef.current = controls;
    } catch (err) {
      setScanning(false);
      setError(
        "Could not access the camera. Your browser may not support camera scanning, or permission was denied — you can still enter the code manually below."
      );
    }
  }

  function stopScanning() {
    controlsRef.current?.stop();
    setScanning(false);
  }

  useEffect(() => () => controlsRef.current?.stop(), []);

  function onManualSubmit(e: FormEvent) {
    e.preventDefault();
    if (manualCode.trim()) lookup(manualCode.trim());
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-forest-900">
        <ScanLine className="h-6 w-6" /> Scan Medicine Barcode / QR
      </h1>
      <p className="mt-1 text-sm text-forest-500">
        Scan the barcode or QR code on a medicine's packaging to jump straight to its AyurSethu listing.
      </p>

      <Card className="mt-6">
        {scanning ? (
          <div>
            <video ref={videoRef} className="w-full rounded-lg bg-black" />
            <Button variant="outline" className="mt-3 w-full" onClick={stopScanning}>
              Stop scanning
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={startScanning}>
            <Camera className="h-4 w-4" /> Start camera scan
          </Button>
        )}

        {error && <div className="mt-3"><ErrorState message={error} /></div>}

        <div className="mt-6 border-t border-forest-100 pt-4">
          <p className="text-sm font-medium text-forest-800">Or enter the code manually</p>
          <form onSubmit={onManualSubmit} className="mt-2 flex gap-2">
            <Input value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="e.g. 8901234500011" />
            <Button type="submit" variant="outline" disabled={lookingUp || !manualCode.trim()}>
              {lookingUp ? "Looking up..." : "Find"}
            </Button>
          </form>
          <p className="mt-2 text-xs text-forest-500">
            Try the demo code <code>8901234500011</code> (Ashwagandha Tablets, seed data).
          </p>
        </div>
      </Card>
    </div>
  );
}
