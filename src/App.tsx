import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { Shell } from './components/layout/Shell';
import Home from './pages/Home';
import Contacts from './pages/Contacts';
import ContactForm from './pages/ContactForm';
import ContactDetail from './pages/ContactDetail';
import PromoContactDetail from './pages/PromoContactDetail';
import Campaigns from './pages/Campaigns';
import CampaignNew from './pages/CampaignNew';
import CampaignWork from './pages/CampaignWork';
import Lists from './pages/Lists';
import Settings from './pages/Settings';
import { Toaster } from '@/components/ui/atoaster';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function App() {
  return (
    <TooltipProvider>
        <WouterRouter hook={useHashLocation}>
        <Shell>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/contacts" component={Contacts} />
            
            <Route path="/contacts/new" component={() => <ContactForm />} />
            <Route path="/contacts/new-promo" component={() => <ContactForm isPromo={true} />} />
            <Route path="/contacts/:id/edit" component={() => <ContactForm />} />
            <Route path="/contacts/promo/:id/edit" component={() => <ContactForm isPromo={true} />} />
            <Route path="/contacts/promo/:id" component={PromoContactDetail} />
            <Route path="/contacts/:id" component={ContactDetail} />
            
            <Route path="/campaigns" component={Campaigns} />
            <Route path="/campaigns/new" component={CampaignNew} />
            <Route path="/campaigns/:id" component={CampaignWork} />
            
            <Route path="/lists" component={Lists} />
            <Route path="/settings" component={Settings} />
            
            <Route>
              <div className="p-8 text-white">404 - Not Found</div>
            </Route>
          </Switch>
        </Shell>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}
