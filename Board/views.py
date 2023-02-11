from django.shortcuts import render, redirect
from django.core import serializers #Um den Serializer von Django benutzen zu können
from django.contrib.auth import authenticate, login, logout #Für den Login & Logout
from django.contrib.auth.decorators import login_required #Für Login
from rest_framework import viewsets, permissions, authentication, exceptions #Um die Viewsets des REST-Frameworks benutzen zu können
from .serializers import UsersSerializer, ListsSerializer, TicketsSerializer #Um den Serializer aus serializers.py benutzen zu können
from django.http import HttpResponse #Um das HttpResponseObjekt nutzen zu können
from django.contrib.auth.models import User #Model User wird importiert
from .models import List, Ticket, TicketToUser #Models Board & Tickets werden importiert
from django.http import HttpResponseRedirect, JsonResponse #Zum Weiterleiten


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('id')
    serializer_class = UsersSerializer
    permission_classes = [] #Zugriffsrechte falls gewünscht [permissions.IsAuthenticated]
    authentication_classes =[]

    def create(self, request): #POST
        newUser = User.objects.create_user(username= request.data.get('username'),
                                           first_name= request.data.get('first_name',''), 
                                           last_name= request.data.get('last_name',''),
                                           email= request.data.get('email',''),
                                           password= request.data.get('password'),
                                          )                                         
        serialized_obj = serializers.serialize('json', [newUser, ]) # We have to transform our created object into JSON via a serializer 
        return HttpResponse(serialized_obj, content_type='application/json')


class TicketViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tickets to be viewed or edited.
    """
    
    #If GET-Request: We receive a Queryset
    queryset = Ticket.objects.all().order_by('id')
    serializer_class = TicketsSerializer
    #permission_classes = [permissions.IsAuthenticatedOrReadOnly] #Zugriffsrechte falls gewünscht [permissions.IsAuthenticated]
    #authentication_classes =[authentication.SessionAuthentication]
    
    # def handle_exception(self):
    #     return HttpResponseRedirect('/login/')


    def put(self, request): #PUT
     print('UPDATE SOLLTE PERFORMED WERDEN ', Ticket.objects.get(id=request.data.get('id')))
     ObjectToUpdate = Ticket.objects.get(id=request.data.get('id'))
     ObjectToUpdate.ticket_description = request.data.get('ticket_description')
     ObjectToUpdate.ticket_title= request.data.get('ticket_title')
     ObjectToUpdate.ticket_duedate= request.data.get('ticket_duedate')
     ObjectToUpdate.ticket_prio= request.data.get('ticket_prio')
     ObjectToUpdate.ticket_created_at= request.data.get('ticket_created_at')

     getListInstance=List.objects.get(id=request.data.get('ticket_list'))
     ObjectToUpdate.ticket_list = getListInstance #ForeignKey; List-Instance needed???

     userinstancearray=[]
     for item in request.data.get('ticket_to_user'):
         print('UserID ',item)
         userinstancearray.append(User.objects.get(id=item))
     ObjectToUpdate.ticket_to_user.set(userinstancearray) #ManyToMany; User-Instance needed

     ObjectToUpdate.save()
     return render(request, 'board/board.html', {'tickets': Ticket.objects.all()})

    def delete(self, request): #DELETE
     print('DELETE SOLLTE PERFORMED WERDEN ')
     ObjectToBeDeleted = Ticket.objects.get(id=request.data.get('id'))
     ObjectToBeDeleted.delete()
     return JsonResponse({"Deleted": True})
    
    def list(self, request): #GET
     print('GET SOLLTE PERFORMED WERDEN ')
     toDos = Ticket.objects.filter(ticket_list=1)
     inProgress = Ticket.objects.filter(ticket_list=2)
     for inPro in inProgress:
      print(inPro.ticket_to_user.all())
      
     awaitingFeedback = Ticket.objects.filter(ticket_list=3)
     dones = Ticket.objects.filter(ticket_list=4)
    #  print(serializers.serialize('json', [dones [0], ]))
    #  print(dones [1])
    #  print(dones [2])
     return render(request, 'board/board.html', {'toDos': toDos,'inProgress':inProgress,'awaitingFeedback':awaitingFeedback,'dones':dones})

    def create(self, request): #POST
        print('POST SOLLTE PERFORMED WERDEN')

        userinstancearray=[]
        for item in request.data.get('ticket_to_user'):
         print('UserID ',item)
         userinstancearray.append(User.objects.get(id=item))
         print(userinstancearray)
        newTicket = Ticket.objects.create(ticket_description = request.data.get('ticket_description'),
                                           ticket_title= request.data.get('ticket_title'),
                                           ticket_duedate= request.data.get('ticket_duedate'),
                                           ticket_prio= request.data.get('ticket_prio'),
                                           ticket_created_at= request.data.get('ticket_created_at'),
                                           ticket_list=List.objects.get(id=request.data.get('ticket_list')), #ForeignKey; List-Instance needed???  
                                           )                           
        newTicket.ticket_to_user.set(userinstancearray) #ManyToMany; User-Instance needed
        return render(request, 'board/board.html', {'tickets': Ticket.objects.all()})

class ListViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tickets to be viewed or edited.
    """
    #If GET-Request: We receive a Queryset
    queryset = List.objects.all().order_by('id')
    serializer_class = ListsSerializer
    permission_classes = [] #Zugriffsrechte falls gewünscht [permissions.IsAuthenticated]

    def create(self, request): #POST
        newList = List.objects.create(list_name= request.data.get('list_name'),)
        serialized_obj = serializers.serialize('json', [newList, ]) # We have to transform our created object into JSON via a serializer 
        return HttpResponse(serialized_obj, content_type='application/json')


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