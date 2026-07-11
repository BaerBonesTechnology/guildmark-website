/** ViewModel for the offer dialog: counter-input state + accept/counter/decline. */
import { useState } from "react";
import { useRespondToOffer } from "../lib/apiHooks";

export function useOfferDialogViewModel(offerIdent: string, onResolved: () => void) {
  const respond = useRespondToOffer();

  const [counterPrice, setCounterPrice] = useState("");
  const [isCountering, setIsCountering] = useState(false);

  function accept() {
    respond.mutate({ offerId: offerIdent, action: "accept" }, { onSuccess: finish });
  }

  function cancelCounter() {
    setIsCountering(false);
    setCounterPrice("");
  }

  function decline() {
    respond.mutate({ offerId: offerIdent, action: "reject" }, { onSuccess: finish });
  }

  function finish() {
    reset();
    onResolved();
  }

  function reset() {
    setIsCountering(false);
    setCounterPrice("");
  }

  function sendCounter() {
    const amount = parseFloat(counterPrice);
    if (Number.isNaN(amount) || amount <= 0) return;
    respond.mutate({ offerId: offerIdent, action: "counter", counter_price: amount }, { onSuccess: finish });
  }

  function startCounter(seedPrice: string) {
    setCounterPrice(seedPrice);
    setIsCountering(true);
  }

  return {
    accept,
    cancelCounter,
    counterPrice,
    decline,
    isBusy: respond.isPending,
    isCountering,
    reset,
    sendCounter,
    setCounterPrice,
    startCounter,
  };
}
