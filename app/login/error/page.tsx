"use client"

import Error from 'next/error'

export default function ErrorPage() {
  return <Error statusCode={403} title={"There was a problem when logging you in. Please try again"}/>
}