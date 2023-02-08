from django.shortcuts import render
from django.core import serializers #Um den Serializer von Django benutzen zu können
from rest_framework import viewsets #Um die Viewsets des REST-Frameworks benutzen zu können
from .serializers import UserSerializer, BoardSerializer, TicketSerializer #Um den Serializer aus serializers.py benutzen zu können
from django.http import HttpResponse #Um das HttpResponseObjekt nutzen zu können
from django.contrib.auth.models import User #Model User wird importiert
from .models import Board, Ticket #Models Board & Tickets werden importiert


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    #If GET-Request: We receive a Queryset
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [] #Zugriffsrechte falls gewünscht [permissions.IsAuthenticated]

    def create(self, request): #If POST-Request: We create a new User
        newUser = User.objects.create_user(username= request.data.get('username'), #POST or data; If nothing in the variable, the empty strings will be used
                                           first_name= request.data.get('first_name',''), 
                                           last_name= request.data.get('last_name',''),
                                           email= request.data.get('email'),
                                           password= request.data.get('password'),
                                          )                                         
        serialized_obj = serializers.serialize('json', [newUser, ]) # We have to transform our created object into JSON via a serializer 
        return HttpResponse(serialized_obj, content_type='application/json')


class BoardViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows boards to be viewed or edited.
    """
    #If GET-Request: We receive a Queryset
    queryset = Board.objects.all().order_by('id')
    serializer_class = BoardSerializer
    permission_classes = [] #Zugriffsrechte falls gewünscht [permissions.IsAuthenticated]

    def create(self, request): #If POST-Request: We create a new Board
        print ('Board_Name ',request.data.get('board_name'))
        print ('Board_User ',request.data.get('board_user'))
        print ('Board_created_at ',request.data.get('board_created_at'))
        print ('Board_to_User ',request.data.get('board_to_user'))
        getUserInstance=User.objects.get(id=request.data.get('board_user'))
        print ('getUserInstance ',getUserInstance)
        #for item in request.data.get('board_to_user'):
        # print(item)

        newBoard = Board.objects.create(board_name= request.data.get('board_name'), #POST or data; If nothing in the variable, the empty strings will be used
                                       board_user= getUserInstance, #ForeignKey; User-Instance needed
                                       board_created_at= request.data.get('board_created_at','')
                                       #board_to_user =  request.data.get('board_to_user') #ManyToMany
                                      )                            
        newBoard.board_to_user.set([User.objects.get(id=1),User.objects.get(id=6)])
        serialized_obj = serializers.serialize('json', [newBoard, ]) # We have to transform our created object into JSON via a serializer 
        return HttpResponse(serialized_obj, content_type='application/json')

class TicketViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tickets to be viewed or edited.
    """
    #If GET-Request: We receive a Queryset
    queryset = Ticket.objects.all().order_by('id')
    serializer_class = TicketSerializer
    permission_classes = [] #Zugriffsrechte falls gewünscht [permissions.IsAuthenticated]

    def create(self, request): #If POST-Request: We create a new Ticket
        print ('Unser Request-Objekt ',request)
        print ('Unser Request-Objekt ',request.data.get('board_name'))
        print ('Unser Request-Objekt ',request.data.get('board_user'))
        print ('Unser Request-Objekt ',request.data.get('board_created_at'))
        print ('Unser Request-Objekt ',request.data.get('board_to_user'))
        newTicket = Ticket.objects.create(ticket_description= request.data.get('ticket_description'), #POST or data; If nothing in the variable, the empty strings will be used
                                       ticket_title= request.data.get('ticket_title',''),
                                       ticket_duedate= request.data.get('ticket_duedate',''),
                                       ticket_prio= request.data.get('ticket_prio'),
                                       ticket_category= request.data.get('ticket_category'),
                                       ticket_created_at= request.data.get('ticket_created_at'),
                                       ticket_to_user= request.data.get('ticket_to_user'),
                                       ticket_board= request.data.get('ticket_board'),
                                      )
        serialized_obj = serializers.serialize('json', [newTicket, ]) # We have to transform our created object into JSON via a serializer 
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