from django.shortcuts import render, redirect
from django.core import serializers #Um den Serializer von Django benutzen zu können
from django.contrib.auth import authenticate, login, logout #Für den Login & Logout
from django.contrib.auth.decorators import login_required #Für Login
from django.http import HttpResponseRedirect, JsonResponse, Http404 #Zum Weiterleiten

from .serializers import UsersSerializer, ListsSerializer, TicketsSerializer #Um den Serializer aus serializers.py benutzen zu können
from django.http import HttpResponse #Um das HttpResponseObjekt nutzen zu können
from django.contrib.auth.models import User #Model User wird importiert
from .models import List, Ticket, TicketToUser #Models Board & Tickets werden importiert
import datetime #Um Datum umzuwandeln

from rest_framework.response import Response
from rest_framework import viewsets, permissions, authentication, status #Um die Viewsets des REST-Frameworks benutzen zu können
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('id')
    serializer_class = UsersSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes =[authentication.TokenAuthentication]


    def create(self, request): #POST
        newUser = User.objects.create_user(username= request.data.get('username'),
                                           first_name= request.data.get('first_name',''), 
                                           last_name= request.data.get('last_name',''),
                                           email= request.data.get('email',''),
                                           password= request.data.get('password'),
                                          )                                         
        serialized_obj = serializers.serialize('json', [newUser, ]) # We have to transform our created object into JSON via a serializer 
        return HttpResponse(serialized_obj, content_type='application/json')



class ListViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tickets to be viewed or edited.
    """
    #If GET-Request: We receive a Queryset
    queryset = List.objects.all().order_by('id')
    serializer_class = ListsSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes =[authentication.TokenAuthentication]

    def create(self, request): #POST
        newList = List.objects.create(list_name= request.data.get('list_name'),)
        serialized_obj = serializers.serialize('json', [newList, ]) # We have to transform our created object into JSON via a serializer 
        return HttpResponse(serialized_obj, content_type='application/json')

class TicketAPI(APIView):
    """
    List all tickets, or create a new ticket.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes =[authentication.TokenAuthentication]

    def get(self, request, format=None):
        print('GET SOLLTE PERFORMED WERDEN ')
        tickets = Ticket.objects.all()
        serializer = TicketsSerializer(tickets, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        print('POST SOLLTE PERFORMED WERDEN ')
        serializer = TicketsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TicketAPIDetail(APIView):
    """
    Retrieve, update or delete a ticket instance.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes =[authentication.TokenAuthentication]
    
    def get_object(self, pk):
        try:
            return Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
     print('GET-DETAIL SOLLTE PERFORMED WERDEN ')
     snippet = self.get_object(pk)
     serializer = TicketsSerializer(snippet)
     return Response(serializer.data)

    def put(self, request, pk, format=None): #PUT
     print('PUT SOLLTE PERFORMED WERDEN ')
     ticket = self.get_object(pk)
     serializer = TicketsSerializer(ticket, data=request.data)
     if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        print('DELETE SOLLTE PERFORMED WERDEN ')
        ticket = self.get_object(pk)
        ticket.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)




@login_required(login_url='/login/') #board is only accessible if logged in, otherwise you will get redirected to login
def board_view(request):
 """
  This is a view that allows tickets to be viewed
 """
 return render(request, 'board/board.html')
 

def register_view(request):
 """
  This is a view to register the user. It generates a 500 Server Error if user alreasy exists
 """
 if request.method == 'POST' and request.POST.get('password1') == request.POST.get('password2'):
   username=request.POST.get('username')
   password1=request.POST.get('password1')
   createduser = User.objects.create_user(username=username,password=password1) #User is created -> Error if user exists
   createduser = User.objects.filter(username=createduser) #Filters the created user -> Error if user exists
   return JsonResponse({"Registered": True}) #returns JSON, without key
 return render(request, 'register/register.html') #GET-Request

def login_view(request):
    """
     This is a view to login the user if not logged in, otherwise redirects to Board-HTML
    """   
    if request.method == 'POST':
       user = authenticate(username=request.POST.get('username'), password=request.POST.get('password')) #Authentification of User possible?
       if user != 'None': 
           #User authenticated/registered (username & password are correct)
           login(request,user) #Logs in the User
           token = Token.objects.get_or_create(user=user)
           print('TOKENNNNNNNNNNNNNNNN ', token)
           print('TOKEN vom User-Objekt ', user.auth_token.key)
           return JsonResponse({"LoggedIn": True, "RedirectTo": '/board/'})
       else: 
           #User not authenticated/registered (username or password is not correct)
           return JsonResponse({"LoggedIn": False, "RedirectTo": '/login/'})
    return render(request, 'login/login.html') #GET-Request

def logout_view(request):
 """
 This is a view to logout the user if logged in, otherwise redirects to Login-HTML
 """
 if request.user.is_authenticated:
   logout(request)
   textforuser = 'Logged out successfully. Thanks for using KanbanBoard ;)'
 else:
   return HttpResponseRedirect('/login/')

 return render(request, 'logout/logout.html',{'textforuser': textforuser})    