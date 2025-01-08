'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import axios, { Axios, AxiosError } from 'axios'
import { useEffect, useState } from "react"
import {useDebounceCallback } from 'usehooks-ts'
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"


function page() {

  const [username, setUsername] = useState('')
  const [usernameMessage, setUsernameMessage] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Custom hook that returns a debounced version of the provided value, along with a function to update it.
  // this debounce will controller values ex: username. usernameMessage  
  // main aim of debounce is to add delay to any work
  // A debounce function debouncedCallback typically wraps around the callback function you want to control. It manages a timer that gets reset whenever the user triggers the event. The debounced function executes the original callback only when the timer's delay has elapsed without any new events.
  const debounced = useDebounceCallback(setUsername, 300)
  const { toast } = useToast() // first add toast in layout
  const router = useRouter() // from navigation

  //zod implementation
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    }
  })

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true)
        setUsername('')
        try {
          const response = await axios.get(`/api/check-username-unique?username=${username}`)
          setUsernameMessage(response.data.message)
        //   console.log(response.data.message);
        }
        catch (error) {
          const axiosError = error as AxiosError<ApiResponse>
          setUsernameMessage(axiosError.response?.data.message ?? "error checking username")
        }
        finally {
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUnique()
  }, [username])


  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)

    try {
      const response = await axios.post('/api/sign-up', data)
      toast({
        title: 'Success',
        description: response.data.message
      })

      router.replace(`/verify/${username}`)
      setIsSubmitting(false)
    }
    catch (error) {
      console.error("error in signup user")
      const axiosError = error as AxiosError<ApiResponse>
      let errorMessage = axiosError.response?.data.message
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive"
      })
      setIsSubmitting(false)
    }
  }

  return (

    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystery Message
          </h1>
          <p className="mb-4">Signup to start your anonymous adventure</p>
        </div>

        {/* in render field in callback will be collecting data and transfering further */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        debounced(e.target.value)
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  <p className={`text-sm ${usernameMessage === "Username is available" ? 'text-green-500' : 'text-red-500' }`}>
                    {usernameMessage}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* here we dont need to give on change whwn we click on submit at that time it automatically do */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled = {isSubmitting} >
              {
                isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : ('SignUp')
              }
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href='sign-in' className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>

  )
}

export default page