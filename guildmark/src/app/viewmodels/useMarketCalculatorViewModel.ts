/** ViewModel for Market Pulse: form state + valuation orchestration. */
import { useMemo, useState } from "react";
import { usePlatformFees, useValuationEstimate } from "../lib/apiHooks";
import { buildValuationRequest, computeRecovery } from "../services/calculator.service";
import { calculatorSellerFeeRate } from "../services/platformFee.service";

export function useMarketCalculatorViewModel() {
  const [ageMonths, setAgeMonths] = useState<number>(12);
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [cpu, setCpu] = useState("");
  const [includeDataWipe, setIncludeDataWipe] = useState(true);
  const [model, setModel] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [ram, setRam] = useState("");

  const { data: fees } = usePlatformFees();
  const platformFeePct = calculatorSellerFeeRate(fees);

  const valuationRequest = useMemo(
    () => buildValuationRequest({ ageMonths, brand, condition, cpu, model, ram }),
    [ageMonths, brand, condition, cpu, model, ram],
  );

  const valuation = useValuationEstimate(valuationRequest);
  const showResults = !!valuationRequest;

  const fmvPerUnit = valuation.data?.fair_market_value ?? 0;
  const confidence = valuation.data?.confidence ?? 0;

  const recovery = computeRecovery(fmvPerUnit, quantity, includeDataWipe, platformFeePct);

  return {
    ageMonths, brand, condition, confidence, cpu, fees, fmvPerUnit, includeDataWipe,
    model, platformFeePct, quantity, ram, recovery, setAgeMonths, setBrand, setCondition, setCpu,
    setIncludeDataWipe, setModel, setQuantity, setRam, showResults, valuation,
  };
}
