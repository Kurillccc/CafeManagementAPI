from django.shortcuts import render

def page1(request):
    return render(request, 'page1.html')

def page2(request):
    return render(request, 'page2.html')
