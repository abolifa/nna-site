import { ParamValue } from "next/dist/server/request/params";
import React from "react";

interface ErrorComponentProps {
  error: Error;
  keyParam?: ParamValue | undefined;
}

const ErrorComponent = ({ error, keyParam }: ErrorComponentProps) => {
  return <div>Error: {error.message}</div>;
};

export default ErrorComponent;
