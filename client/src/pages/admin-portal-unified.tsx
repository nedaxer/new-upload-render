import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showSuccessNotification, showErrorNotification } from '@/hooks/use-global-notification';
import { AdminPullToRefresh } from "@/components/admin-pull-to-refresh";
import AdminDepositCreator from "@/components/admin-deposit-creator";
import AdminWithdrawalCreator from "@/components/admin-withdrawal-creator";
import ContactMessagesManager from "@/components/contact-messages-manager";
import { apiRequest } from "@/lib/queryClient";

export default function UnifiedAdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: "", password: "" });
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {!isAuthenticated ? (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center">Admin Portal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="email"
                placeholder="Admin Email"
                value={adminCredentials.email}
                onChange={(e) => setAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                type="password"
                placeholder="Admin Password"
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button 
                onClick={() => setIsAuthenticated(true)} 
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Access Admin Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Unified Admin Portal</h1>
            <p className="text-gray-300">Comprehensive platform management</p>
          </div>
          
          <AdminPullToRefresh>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-800">
                <TabsTrigger value="overview" className="data-[state=active]:bg-orange-600">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-orange-600">
                  Users
                </TabsTrigger>
                <TabsTrigger value="deposits" className="data-[state=active]:bg-orange-600">
                  Deposits
                </TabsTrigger>
                <TabsTrigger value="messages" className="data-[state=active]:bg-orange-600">
                  Messages
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Platform Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">Admin dashboard overview content...</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="users">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">User management content...</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="deposits">
                <AdminDepositCreator />
                <AdminWithdrawalCreator />
              </TabsContent>
              
              <TabsContent value="messages">
                <ContactMessagesManager />
              </TabsContent>
            </Tabs>
          </AdminPullToRefresh>
        </div>
      )}
    </div>
  );
}