from django.test import TestCase
from django.test import Client
from django.contrib.auth.models import User
from django.contrib import auth
from .models import List
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient, APITestCase

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

#Authenticate a newly created User
class TestAuth(APITestCase):
 def setUpAuthentication(self):
   self.user = User.objects.create_user(username='testuser', password='12345')
   self.token = Token.objects.create(user=self.user)
   self.client = APIClient()
   self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

# Get a List
class TestGetList(APITestCase):
 def test_list_get(self):
    self.client = Client()
    response = self.client.get('/lists/')
    self.assertEqual(response.status_code,200)

# Post a List
class TestPostList(APITestCase):   
 def test_list_post(self):
   TestAuth.setUpAuthentication(self)
   data = {'id':'','list_name':'Another List'}
   response = self.client.post('/lists/', data)
   self.assertEqual(response.status_code, 201)

# Get a Ticket
class TestGetTicket(APITestCase):
 def test_ticket_get(self):
    self.client = Client()
    response = self.client.get('/tickets/')
    self.assertEqual(response.status_code,200)

# Post, Put & Delete a Ticket
class TestPostTicket(APITestCase):
 def setUpLists(self):
   List.objects.create(list_name='To Do')
   List.objects.create(list_name='In Progress')
   List.objects.create(list_name='Awaiting Feedback')
   List.objects.create(list_name='Done')
   
 def test_ticket_post(self): #POST
   TestPostTicket.setUpLists(self)
   TestAuth.setUpAuthentication(self)
   data = {'id':'','ticket_description':'x','ticket_title':'x','ticket_duedate':'2023-02-17','ticket_prio':'w','ticket_created_at':'2023-02-17','ticket_list':'1','ticket_to_user':''}
   response = self.client.post('/tickets/', data)
   self.assertEqual(response.status_code, 201)

 def test_ticket_put(self): #PUT (directly performed after POST)
   TestPostTicket.test_ticket_post(self)
   data = {'id':'1','ticket_description':'y','ticket_title':'x','ticket_duedate':'2023-02-17','ticket_prio':'w','ticket_created_at':'2023-02-17','ticket_list':'1','ticket_to_user':''}
   response = self.client.put('/tickets/1/', data)
   self.assertEqual(response.status_code, 200)

 def test_ticket_delete(self): #DELETE (directly performed after POST & PUT)
   TestPostTicket.test_ticket_post(self)
   data = {'id':'1'}
   response = self.client.delete('/tickets/1/', data)
   self.assertEqual(response.status_code, 204)  