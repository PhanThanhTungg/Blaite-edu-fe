"use client";

import { useState } from "react";
import { Card, Avatar, Button } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import { BetaSchemaForm } from "@ant-design/pro-components";
import { useMutation } from "@tanstack/react-query";
import { message } from "antd";

interface UserProfileProps {
  user: {
    id: number;
    email: string;
    name: string | null;
    createdAt: Date;
  };
}

interface ProfileFormValues {
  name: string;
  email: string;
}

export default function UserProfile({ user }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      // TODO: Replace serverActions.updateUserProfile calls with corresponding API when available.
      // serverActions.updateUserProfile(values.name, values.email),
      // Suggestion: Use corresponding API function from hooks/api.ts, for example:
      // await api.put('/api/user', { name: values.name, email: values.email })
      Promise.resolve(), // Placeholder for API call
    onSuccess: () => {
      message.success("Profile updated successfully!");
      setIsEditing(false);
      // Refresh the page to show updated data
      window.location.reload();
    },
    onError: (error) => {
      message.error("Failed to update profile");
      console.error("Update profile error:", error);
    },
  });

  const handleCancel = () => {
    setIsEditing(false);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      formItemProps: {
        rules: [
          { required: true, message: "Please enter your name" },
          { min: 2, message: "Name must be at least 2 characters" },
        ],
      },
      fieldProps: {
        placeholder: "Enter your name",
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      formItemProps: {
        rules: [
          { required: true, message: "Please enter your email" },
          {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Please enter a valid email",
          },
        ],
      },
      fieldProps: {
        placeholder: "Enter your email",
      },
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>User Profile</span>
        </div>
      }
      extra={
        !isEditing && (
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )
      }
    >
      {isEditing ? (
        <BetaSchemaForm<ProfileFormValues>
          layoutType="Form"
          columns={columns}
          initialValues={{
            name: user.name || "",
            email: user.email,
          }}
          onFinish={async (values) => {
            await updateProfileMutation.mutateAsync(values);
            return true;
          }}
          submitter={{
            searchConfig: {
              submitText: "Save",
              resetText: "Cancel",
            },
            submitButtonProps: {
              loading: updateProfileMutation.isPending,
              disabled: updateProfileMutation.isPending,
            },
            resetButtonProps: {
              disabled: updateProfileMutation.isPending,
              onClick: handleCancel,
            },
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">
                {user.name || "No name set"}
              </h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-medium">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="font-medium">Standard</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
