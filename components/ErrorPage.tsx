"use client";

import Error from 'next/error'

const ErrorPage: React.FC<{ statusCode: number; title: string }> = ({ statusCode, title }) => {
  return <Error statusCode={statusCode} title={title}/>
}

export default ErrorPage;