from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, JsonResponse, Http404
from .serializers import UsersSerializer, ListsSerializer, TicketsSerializer
from django.contrib.auth.models import User
from .models import List, Ticket
from rest_framework.response import Response
from rest_framework import viewsets, permissions, authentication, status
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
import Board.utils

class UserAPI(APIView):
    """
    List all users, or create a new user.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes =[authentication.TokenAuthentication]

    def get(self, request, format=None):
        print('GET SOLLTE PERFORMED WERDEN ')
        tickets = User.objects.all()
        serializer = UsersSerializer(tickets, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        print('POST SOLLTE PERFORMED WERDEN ')
        serializer = UsersSerializer(data=request.data, partial=True) #Wichtig weil man sonst alle Felder mitschicken muss!!!!!!
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListAPI(APIView):
    """
    API endpoint that allows lists to be viewed or edited.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes =[authentication.TokenAuthentication]

    def get(self, request, format=None):
        print('GET SOLLTE PERFORMED WERDEN ')
        lists = List.objects.all()
        serializer = ListsSerializer(lists, many=True)
        return Response(serializer.data)

    def create(self, request): #POST
        serializer = ListsSerializer(data=request.data, partial=True) #Wichtig weil man sonst alle Felder mitschicken muss!!!!!!
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        print('SERIALIZERRRRR',serializer.errors)        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TicketAPI(APIView):
    """
    List all tickets, or create a new ticket.
    """
    #permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    permission_classes = [permissions.AllowAny]
    authentication_classes =[authentication.TokenAuthentication]

    def get(self, request, format=None):
        print('GET SOLLTE PERFORMED WERDEN ')
        tickets = Ticket.objects.all()
        serializer = TicketsSerializer(tickets, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        print('POST SOLLTE PERFORMED WERDEN ')
        print('INPUT ',request.data)
        serializer = TicketsSerializer(data=request.data, partial=True) #Wichtig weil man sonst alle Felder mitschicken muss!!!!!!
        if serializer.is_valid():
            ticket = serializer.save()  
            related_user_models = Board.utils.Functions.getUserObjectsAsArray(request)
            ticket.ticket_to_user.set(related_user_models)
            print('OUTPUT ',serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
         print('SERIALIZERRRRR',serializer.errors)          
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class TicketAPIDetail(APIView):
    """
    Retrieve, update or delete a ticket instance.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    #permission_classes = [permissions.AllowAny]
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
     print('PUT Ticket-To-USER ',ticket.ticket_to_user.all())
     serializer = TicketsSerializer(ticket, data=request.data, partial=True) #Wichtig weil man sonst alle Felder mitschicken muss!!!!!!
     if serializer.is_valid():
            ticket = serializer.save()  
            related_user_models = Board.utils.Functions.getUserObjectsAsArray(request)
            print('USERMODELS ',related_user_models)
            ticket.ticket_to_user.set(related_user_models)

            return Response(serializer.data)
     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        print('DELETE SOLLTE PERFORMED WERDEN ')
        print('INPUT ',request.data)
        ticket = self.get_object(pk)
        print('TODELETE ',ticket)
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
   User.objects.create_user(username=username,password=password1) #User is created -> Error if user exists
   return JsonResponse({"Registered": True})
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