using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace asme.Controllers
{
    public class TemplatesController : Controller
    {
        public ActionResult TopicCard()
        {
            return PartialView();
        }
    }
}