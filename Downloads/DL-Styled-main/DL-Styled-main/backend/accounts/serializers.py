from rest_framework import serializers
from .models import MyUser

class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = MyUser
        fields = ['username', 'email', 'password', 'confirm_password', 'phone_number']
        extra_kwargs = {
            'password': {'write_only': True},
            'confirm_password': {'write_only': True},
        }

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})

        if MyUser.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Username already exists."})

        if MyUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = MyUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            phone_number=validated_data.get('phone_number', '')
        )
        return user

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields = ['id', 'username', 'email', 'phone_number', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined']