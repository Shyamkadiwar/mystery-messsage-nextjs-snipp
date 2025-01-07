'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import axios, { Axios, AxiosError } from 'axios'
import { useEffect, useState } from "react"
import { useDebounceValue } from 'usehooks-ts'
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import { ApiResponse } from "@/types/ApiResponse"


function page() {
  
  const [username, setUsername] = useState('')
  const [usernameMessage, setUsernameMessage] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Custom hook that returns a debounced version of the provided value, along with a function to update it.
  // this debounce will controller values ex: username. usernameMessage 
  const debouncedUsername = useDebounceValue(username, 300)
  const { toast } = useToast() // first add toast in layout
  const router = useRouter() // from navigation
  
  //zod implementation
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues : {
      username : '',
      email : '',
      password : '',
    }
  })

  useEffect(()=>{
    const checkUsernameUnique = async () => {
      if(debouncedUsername){
        setIsCheckingUsername(true)
        setUsername('')
        try {
          const response = await axios.get(`/api/check-username-unique?username=${debouncedUsername}`)
          setUsernameMessage(response.data.message)
        }
        catch (error) {
          const axiosError = error as AxiosError<ApiResponse>
          setUsernameMessage(axiosError.response?.data.message ?? "error checking username")
        }
        finally{
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUnique()
  },[debouncedUsername])


  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)

    try {
      const response = await axios.post('/api/sign-up', data)
      toast({
        title: 'Success',
        description : response.data.message
      })

      router.replace(`/verify/${username}`)
      setIsSubmitting(false)
    } catch (error) {
      
    }
  }

  return (
    <div>page</div>
  )
}

export default page