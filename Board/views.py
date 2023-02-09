from django.shortcuts import render
from django.core import serializers #Um den Serializer von Django benutzen zu können
from rest_framework import viewsets #Um die Viewsets des REST-Frameworks benutzen zu können
from .serializers import UsersSerializer, ListsSerializer, TicketsSerializer #Um den Serializer aus serializers.py benutzen zu können
from django.http import HttpResponse #Um das HttpResponseObjekt nutzen zu können
from django.contrib.auth.models import User #Model User wird importiert
from .models import List, Ticket #Models Board & Tickets werden importiert
from django.http import JsonResponse

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
    permission_classes = [] #Zugriffsrechte falls gewünscht [permissions.IsAuthenticated]
    authentication_classes =[]

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

    # def list(self, request): #GET
    #  print('GET SOLLTE PERFORMED WERDEN ')
    #  ObjectsToBeDisplayed = Ticket.objects.all()
    #  return render(request, 'board/board.html', {'tickets': ObjectsToBeDisplayed})

    def create(self, request): #POST
        print('POST SOLLTE PERFORMED WERDEN')

        userinstancearray=[]
        for item in request.data.get('ticket_to_user'):
         print('UserID ',item)
         userinstancearray.append(User.objects.get(id=item))

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
        newList = List.objects.create(list_name= request.data.get('list_name'),
                                      )
        serialized_obj = serializers.serialize('json', [newList, ]) # We have to transform our created object into JSON via a serializer 
        return HttpResponse(serialized_obj, content_type='application/json')






# Create your views here.
def board_view(request):
    """
    This is a view to render the board
    """
    if request.method == 'POST':
     return render(request, 'board/board.html')
   
    #If request.method == 'GET'
    return render(request, 'board/board.html')

def register_view(request):
    """
    This is a view to register the user
    """

    return render(request, 'register/register.html')

def login_view(request):
    """
    This is a view to login the user
    """

    return render(request, 'login/login.html')

def logout_view(request):
    """
    This is a view to logout the user
    """

    return render(request, 'logout/logout.html')            