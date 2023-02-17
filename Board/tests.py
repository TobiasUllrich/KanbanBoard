from django.test import TestCase
from django.test import Client
from django.contrib.auth.models import User
from django.contrib import auth
from .models import Ticket, List
import Board.utils

# Register a new User
class TestRegister(TestCase):
   def test_register_user(self):    
    self.client = Client()
    self.client.post('/register/', {'username': 'testuser', 'password1':'12345', 'password2':'12345'})
    getRegisteredUserViaUsername = User.objects.get(username='testuser')
    getRegisteredUserViaId = User.objects.get(id=1) 
    self.assertEqual(getRegisteredUserViaUsername, getRegisteredUserViaId)

# Login an existing User
class TestLogin(TestCase):
 def test_login_user(self):    
    TestRegister.test_register_user(self)
    self.client = Client() 
    response = self.client.login(username='testuser', password='12345')
    self.assertEqual(response,True)
    assert auth.get_user(self.client).is_authenticated

# Logout a User
class TestLogout(TestCase):
   def test_logout(self):
     TestLogin.test_login_user(self)
     self.client.logout()
     assert not auth.get_user(self.client).is_authenticated   

# Create a List
class TestList(TestCase):
 def test_list_create(self):
    TestLogin.test_login_user(self)
    self.client = Client()
    list = List.objects.create()
    response = self.client.post('/lists/', {'id':'','listname':'Done'})
    print('Response from Server ',response)
    self.assertEqual(response.status_code,201)

# Create a Ticket
class TestTicket(TestCase):
 def test_ticket_create(self):
  TestLogin.test_login_user(self)
  self.client = Client()
  ticket = Ticket.objects.create()
  response = self.client.post('/tickets/', {'id':'','ticket_description':'x','ticket_title':'x','ticket_duedate':'2023-02-17','ticket_prio':'w','ticket_created_at':'2023-02-17','ticket_list':'2','ticket_to_user':''})
  print('Response from Server ',response)
  self.assertEqual(response.status_code,201)

class Testreq(TestCase):
 def test_ticket_create(self):
  Board.utils.Functions.test_get_required_fields(self)